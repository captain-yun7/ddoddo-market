package com.ddoddo.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import java.io.IOException;
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
}