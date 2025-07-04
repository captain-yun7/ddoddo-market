"use client";

import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    price: number;
  }) => {
    try {
      await api.post("/api/v1/products", data);
      alert("상품이 성공적으로 등록되었습니다.");
      router.push("/products");
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert("상품 등록에 실패했습니다.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">새 상품 등록</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
