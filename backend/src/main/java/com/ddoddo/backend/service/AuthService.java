package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.UserInfoResponse;
import com.ddoddo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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
                    Map<String, Object> userMetadata = jwt.getClaimAsMap("user_metadata");
                    String picture = null;
                    if (userMetadata != null) {
                        // user_metadata에서 'picture' 또는 'avatar_url' 클레임을 찾습니다.
                        if (userMetadata.containsKey("picture")) {
                            picture = (String) userMetadata.get("picture");
                        } else if (userMetadata.containsKey("avatar_url")) {
                            picture = (String) userMetadata.get("avatar_url");
                        }
                    }
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
