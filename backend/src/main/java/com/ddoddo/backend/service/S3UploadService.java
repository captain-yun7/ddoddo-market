package com.ddoddo.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3UploadService {

    private final S3Client s3Client; // AmazonS3Client -> S3Client (v2)

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile multipartFile, String dirName) throws IOException {
        String originalFilename = multipartFile.getOriginalFilename();
        String s3FileName = dirName + "/" + UUID.randomUUID() + "_" + originalFilename;

        // PutObjectRequest (v2)
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(s3FileName)
                .acl(ObjectCannedACL.PUBLIC_READ) // ACL 설정
                .build();

        // RequestBody (v2)
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(multipartFile.getBytes()));

        // GetUrlRequest (v2)
        GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                .bucket(bucket)
                .key(s3FileName)
                .build();

        return s3Client.utilities().getUrl(getUrlRequest).toString();
    }

    public void deleteImage(String fileUrl) {
        try {
            // 1. 전체 URL에서 경로(/<버킷이름>/<파일경로>)를 추출합니다.
            String path = new URL(fileUrl).getPath();

            // 2. 경로의 맨 앞 '/'와 버킷 이름을 제거하여 순수한 파일 키만 남깁니다.
            // 예: "/ddoddo-market-images/product-images/abc.png" -> "product-images/abc.png"
            String key = path.substring(bucket.length() + 2); // 슬래시 2개(/, /)만큼 추가로 잘라냅니다.

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("R2에서 파일 삭제 성공: {}", key);
        } catch (Exception e) {
            log.error("R2 파일 삭제 실패. URL: {}, 에러: {}", fileUrl, e.getMessage());
        }
    }
}