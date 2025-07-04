export interface User {
  uid: string;
  nickname: string;
  profileImageUrl: string;
}

export interface Product {
  id: number;
  title: string;
  content: string;
  price: number;
  status: "FOR_SALE" | "RESERVED" | "SOLD_OUT";
  createdAt: string;
  updatedAt?: string;
  user: User;

  // user 객체 대신 사용자 정보를 직접 포함하도록 수정
  userUid: string;
  userNickname: string;
  userProfileImageUrl: string;
}
