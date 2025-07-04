"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Product } from "@/types";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useProduct } from "@/hooks/useProducts"; // 커스텀 훅 사용

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { product, loading, error } = useProduct(id as string); // 커스텀 훅으로 데이터 페칭
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // 상품 데이터나 사용자 정보가 변경될 때 소유권 확인
    const checkOwnership = async () => {
      if (product) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        // product.user.uid 대신 product.userUid 사용
        if (user && product.userUid === user.id) {
          setIsOwner(true);
        }
      }
    };
    checkOwnership();
  }, [product]);

  const handleDelete = async () => {
    if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/v1/products/${id}`);
        alert("상품이 삭제되었습니다.");
        router.push("/products");
      } catch (err) {
        alert("상품 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!product)
    return <p className="text-center mt-10">상품을 찾을 수 없습니다.</p>;

  return (
    <main className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        <div className="text-gray-600 mb-4">
          {/* product.user.nickname 대신 product.userNickname 사용 */}
          <p>판매자: {product.userNickname}</p>
          <p>가격: {new Intl.NumberFormat("ko-KR").format(product.price)}원</p>
          <p>상태: {product.status}</p>
        </div>
        <div className="prose max-w-none mb-6">
          <p>{product.content}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/products">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              목록으로
            </button>
          </Link>
          {isOwner && (
            <>
              <Link href={`/products/${id}/edit`}>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  수정하기
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                삭제하기
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
