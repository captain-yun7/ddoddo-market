package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.ProductImage;
import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.product.ProductCreateRequest;
import com.ddoddo.backend.dto.product.ProductResponse;
import com.ddoddo.backend.dto.product.ProductUpdateRequest;
import com.ddoddo.backend.repository.ProductRepository;
import com.ddoddo.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final S3UploadService s3UploadService; // S3 서비스 주입

    /**
     * 상품 등록 (이미지 포함)
     */
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, List<MultipartFile> images, String uid) throws IOException {
        User user = userRepository.findByUid(uid)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Product product = Product.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .price(request.getPrice())
                .user(user)
                .build();

        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                String imageUrl = s3UploadService.upload(file, "product-images");
                // 빌더에 displayOrder 추가
                product.addImage(ProductImage.builder()
                        .imageUrl(imageUrl)
                        .product(product)
                        .displayOrder(i) // 리스트의 인덱스를 순서로 저장
                        .build());
            }
        }

        Product savedProduct = productRepository.save(product);
        return ProductResponse.from(savedProduct);
    }
//    /**
//     * 상품 등록
//     */
//    @Transactional
//    public ProductResponse createProduct(ProductCreateRequest request, String uid) {
//        User user = userRepository.findByUid(uid)
//                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
//
//        Product product = Product.builder()
//                .title(request.getTitle())
//                .content(request.getContent())
//                .price(request.getPrice())
//                .user(user)
//                .build();
//
//        Product savedProduct = productRepository.save(product);
//        return ProductResponse.from(savedProduct);
//    }

    /**
     * 상품 상세 조회
     */
    public ProductResponse getProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다."));
        return ProductResponse.from(product);
    }

    /**
     * 상품 목록 조회
     */
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 상품 수정
     */
    @Transactional
    public ProductResponse updateProduct(Long productId, ProductUpdateRequest request, String uid) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다."));

        // 권한 검사
        if (!product.isOwner(uid)) {
            throw new AccessDeniedException("상품을 수정할 권한이 없습니다.");
        }

        product.update(
                request.getTitle(),
                request.getContent(),
                request.getPrice(),
                request.getStatus()
        );

        return ProductResponse.from(product);
    }

    /**
     * 상품 삭제
     */
    @Transactional
    public void deleteProduct(Long productId, String uid) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다."));

        // 권한 검사
        if (!product.isOwner(uid)) {
            throw new AccessDeniedException("상품을 삭제할 권한이 없습니다.");
        }

        productRepository.delete(product);
    }
} 