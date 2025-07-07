package com.ddoddo.backend.controller;

import com.ddoddo.backend.dto.ChatRoomResponse;
import com.ddoddo.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 채팅방 생성 또는 조회
    @PostMapping("/rooms")
    public ResponseEntity<Map<String, Long>> getOrCreateRoom(
            @RequestParam Long productId,
            @AuthenticationPrincipal Jwt jwt) {
        String buyerUid = jwt.getSubject();
        Long roomId = chatService.findOrCreateRoom(productId, buyerUid);
        return ResponseEntity.created(URI.create("/api/v1/chat/rooms/" + roomId))
                .body(Collections.singletonMap("roomId", roomId));
    }

    // 내 채팅방 목록 조회
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getMyRooms(@AuthenticationPrincipal Jwt jwt) {
        String userUid = jwt.getSubject();
        List<ChatRoomResponse> myChatRooms = chatService.findMyChatRooms(userUid);
        return ResponseEntity.ok(myChatRooms);
    }

    // 이전 메시지 조회 (구현 시 추가)
    // @GetMapping("/rooms/{roomId}/messages")
    // public ResponseEntity<Page<ChatMessageResponse>> getMessages(...) { ... }
}