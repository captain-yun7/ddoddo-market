package com.ddoddo.backend.dto.product;

import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.ProductStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProductResponse {
    private Long id;
    private String title;
    private String content;
    private Integer price;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 작성자 정보
    private String userUid;
    private String userNickname;
    private String userProfileImageUrl;
    
    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .content(product.getContent())
                .price(product.getPrice())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .userUid(product.getUser().getUid())
                .userNickname(product.getUser().getNickname())
                .userProfileImageUrl(product.getUser().getProfileImageUrl())
                .build();
    }
} 