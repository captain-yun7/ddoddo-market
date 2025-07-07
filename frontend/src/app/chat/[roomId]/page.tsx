"use client";

import { useParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { messages, sendMessage, connectionStatus } = useChat(user ? roomId : "");

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 새 메시지가 올 때마다 맨 아래로 스크롤하는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // messages 배열이 업데이트될 때마다 실행

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error("사용자 정보를 가져올 수 없습니다.", error);
        setIsLoading(false);
        return;
      }

      setUser(data.user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">사용자 정보를 확인하는 중...</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">채팅을 이용하려면 로그인이 필요합니다.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 채팅방 헤더 */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <p className="font-semibold text-center text-gray-800">채팅방</p>
        <p className="text-sm text-center text-gray-500 mt-1">
          연결 상태:{" "}
          <span
            className={`font-medium ${
              connectionStatus === "연결됨" ? "text-teal-600" : "text-red-500"
            }`}
          >
            {connectionStatus}
          </span>
        </p>
      </div>

      {/* 메시지 표시 영역 */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          
          const isMyMessage = msg.senderUid === user.id;

          return (
            <div
              key={msg.messageId}
              className={`flex items-end gap-3 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              {/* 상대방 메시지일 경우 프로필 아이콘 (왼쪽) */}
              {!isMyMessage && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex-shrink-0 flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {msg.senderNickname?.charAt(0) || "?"}
                  </span>
                </div>
              )}

              {/* 메시지 버블과 시간 컨테이너 */}
              <div
                className={`flex flex-col max-w-xs sm:max-w-sm md:max-w-md ${
                  isMyMessage ? "items-end" : "items-start"
                }`}
              >
                {/* 상대방 닉네임 */}
                {!isMyMessage && (
                  <p className="text-xs text-gray-600 mb-1 px-2 font-medium">
                    {msg.senderNickname}
                  </p>
                )}

                {/* 메시지 버블 */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isMyMessage
                      ? "bg-teal-500 text-white rounded-br-md ml-auto"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md mr-auto"
                  }`}
                >
                  <p className="break-words leading-relaxed">{msg.message}</p>
                </div>

                {/* 시간 */}
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        {/* 스크롤을 위한 빈 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            disabled={!newMessage.trim()}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}