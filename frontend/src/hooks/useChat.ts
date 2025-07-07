import { useState, useEffect, useRef } from "react";
import { Client, IFrame } from "@stomp/stompjs"; // IFrame 타입을 임포트합니다.
import { ChatMessage } from "@/types/chat";
import { createClient } from "@/utils/supabase/client";

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("대기 중...");
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomId) {
      setConnectionStatus("채팅방 정보가 없어 대기 중입니다.");
      return;
    }

    const initializeChat = async () => {
      console.log("[채팅 진단] 1. 채팅 연결을 시작합니다.");
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("[채팅 진단] 🚨 Supabase 세션을 가져올 수 없습니다:", error);
        setConnectionStatus("인증 실패");
        return;
      }
      
      const session = data.session;
      console.log("[채팅 진단] 2. Supabase 세션을 성공적으로 가져왔습니다.");

      if (stompClient.current) {
        console.log("[채팅 진단] 이전 연결이 남아있어 비활성화합니다.");
        stompClient.current.deactivate();
      }
      
      const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
        /^http/,
        "ws"
      )}/ws-stomp`;
      
      console.log(`[채팅 진단] 3. 연결할 WebSocket 주소: ${wsUrl}`);
      console.log(`[채팅 진단] 3-1. 사용할 인증 토큰: Bearer ${session.access_token.substring(0, 30)}...`);
      
      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${session.access_token}`,
        },
        debug: (str) => {
          // STOMP 라이브러리의 상세한 내부 동작을 모두 보여줍니다.
          console.log(`[STOMP 상세 로그] ${str}`);
        },
        reconnectDelay: 10000, // 재연결 시도 간격 (10초)
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // 연결 성공 시 호출됩니다.
      client.onConnect = (frame: IFrame) => {
        console.log("[채팅 진단] ✅ 4. STOMP 연결 성공!", frame);
        setConnectionStatus("연결됨");
        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      };

      // STOMP 프로토콜 수준의 에러 (e.g., 인증 실패로 서버가 연결 거부)
      client.onStompError = (frame: IFrame) => {
        console.error("[채팅 진단] 🚨 4-1. STOMP 에러 발생!", frame);
        setConnectionStatus(`연결 실패: ${frame.headers["message"] || '서버 응답 없음'}`);
      };
      
      // WebSocket 전송 계층 자체의 에러
      client.onWebSocketError = (event: Event) => {
        console.error("[채팅 진단] 🚨 4-2. WebSocket 자체 에러 발생!", event);
        setConnectionStatus("웹소켓 연결 오류");
      };

      console.log("[채팅 진단] 3-2. STOMP 클라이언트 활성화를 시도합니다.");
      client.activate();
      stompClient.current = client;
    };

    initializeChat();

    return () => {
      if (stompClient.current?.active) {
        console.log("[채팅 진단] 컴포넌트가 사라져 연결을 종료합니다.");
        stompClient.current.deactivate();
      }
    };
  }, [roomId]);

  const sendMessage = (messageContent: string) => {
    // 연결 상태를 직접 확인하여 메시지 전송
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/chat/message/${roomId}`,
        body: JSON.stringify({ message: messageContent }),
      });
    } else {
      console.error("[메시지 전송 실패] STOMP 연결이 활성화되지 않았습니다. 현재 상태:", connectionStatus);
      alert(`메시지를 보낼 수 없습니다. 연결 상태: ${connectionStatus}`);
    }
  };

  return { messages, sendMessage, connectionStatus };
}