package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public UserInfoResponse loginOrRegister(Jwt jwt) {
        String uid = jwt.getSubject();
        User user = userRepository.findByUid(uid)
                .orElseGet(() -> {
                    String email = jwt.getClaimAsString("email");
                    String picture = jwt.getClaimAsString("picture"); // 구글 프로필 이미지 URL

                    User newUser = User.builder()
                            .uid(uid)
                            .email(email)
                            .nickname("또또" + System.currentTimeMillis())
                            .profileImageUrl(picture) // 프로필 이미지 저장
                            .build();
                    return userRepository.save(newUser);
                });

        return UserInfoResponse.from(user);
    }
}
