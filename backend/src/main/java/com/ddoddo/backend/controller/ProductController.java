package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.product.ProductCreateRequest;
import com.ddoddo.backend.dto.product.ProductResponse;
import com.ddoddo.backend.dto.product.ProductUpdateRequest;
import com.ddoddo.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 상품 등록
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getSubject();
        ProductResponse response = productService.createProduct(request, uid);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 상품 상세 조회
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long productId) {
        ProductResponse response = productService.getProduct(productId);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * 상품 수정
     */
    @PatchMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getSubject();
        ProductResponse response = productService.updateProduct(productId, request, uid);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품 삭제
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal Jwt jwt) {
        String uid = jwt.getSubject();
        productService.deleteProduct(productId, uid);
        return ResponseEntity.noContent().build();
    }
} 