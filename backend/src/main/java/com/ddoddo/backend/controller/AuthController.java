package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserInfoResponse> login(@AuthenticationPrincipal Jwt jwt) {
        UserInfoResponse userInfo = authService.loginOrRegister(jwt);
        return ResponseEntity.ok(userInfo);
    }
}