"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useProduct } from "@/hooks/useProducts"; // 커스텀 훅 사용

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { product, loading, error } = useProduct(id as string);
  const [isOwner, setIsOwner] = useState(false);
  
  // ❗️ 추가: 대표 이미지 상태 관리
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    const checkOwnershipAndSetImage = async () => {
      if (product) {
        // 소유권 확인
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && product.userUid === user.id) {
          setIsOwner(true);
        }
        
        // ❗️ 대표 이미지 초기 설정
        if (product.images && product.images.length > 0) {
          setMainImage(product.images[0].imageUrl);
        }
      }
    };
    checkOwnershipAndSetImage();
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
  if (!product) return <p className="text-center mt-10">상품을 찾을 수 없습니다.</p>;

  return (
    <main className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        {/* --- 갤러리와 상품 정보가 함께 있는 섹션 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 갤러리 */}
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-2">
              <img
                src={mainImage || "/placeholder.png"} // 이미지가 없을 경우 대비
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image) => (
                  <div 
                    key={image.id} 
                    className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 hover:border-blue-500"
                    // ❗️ 썸네일 클릭 시 대표 이미지 변경
                    onClick={() => setMainImage(image.imageUrl)} 
                  >
                     <img
                       src={image.imageUrl}
                       alt={`상품 이미지 ${image.displayOrder + 1}`}
                       className="w-full h-full object-cover"
                     />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 상품 상세 정보 및 버튼 */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-2xl font-semibold text-gray-800 mb-4">
              {new Intl.NumberFormat("ko-KR").format(product.price)}원
            </p>
            <div className="text-sm text-gray-500 mb-4">
                <p>판매자: {product.userNickname}</p>
                <p>판매상태: {product.status}</p>
            </div>
            {/* 상세 설명 */}
            <div className="prose max-w-none mb-6 flex-grow">
                <p>{product.content}</p>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex gap-2 mt-auto">
              <Link href="/products">
                <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">
                  목록으로
                </button>
              </Link>
              {isOwner && (
                <>
                  <Link href={`/products/${id}/edit`} className="flex-1">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                      수정하기
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
                  >
                    삭제하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}