package com.ddoddo.backend.service;

import com.ddoddo.backend.domain.ChatRoom;
import com.ddoddo.backend.domain.Product;
import com.ddoddo.backend.domain.User;
import com.ddoddo.backend.dto.ChatRoomResponse;
import com.ddoddo.backend.repository.ChatRoomRepository;
import com.ddoddo.backend.repository.ProductRepository;
import com.ddoddo.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Long findOrCreateRoom(Long productId, String buyerUid) {
        User buyer = userRepository.findByUid(buyerUid)
                .orElseThrow(() -> new EntityNotFoundException("구매자를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다."));

        // 판매자와 구매자가 동일하면 채팅방 생성 불가
        if (product.getUser().getUid().equals(buyerUid)) {
            throw new IllegalArgumentException("자신과의 채팅방은 생성할 수 없습니다.");
        }

        ChatRoom chatRoom = chatRoomRepository.findByProductAndBuyer(product, buyer)
                .orElseGet(() -> {
                    ChatRoom newChatRoom = ChatRoom.builder()
                            .product(product)
                            .buyer(buyer)
                            .build();
                    return chatRoomRepository.save(newChatRoom);
                });

        return chatRoom.getId();
    }

    public List<ChatRoomResponse> findMyChatRooms(String userUid) {
        User user = userRepository.findByUid(userUid)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByUser(user);

        return chatRooms.stream()
                .map(chatRoom -> ChatRoomResponse.of(chatRoom, user))
                .collect(Collectors.toList());
    }

    // 이전 메시지 조회 로직 (ChatMessage 관련 DTO 및 Repository 필요)
    // public Page<ChatMessageResponse> findChatMessages(Long roomId, Pageable pageable) { ... }
}