"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Product } from "@/types";

interface ProductFormData {
  title: string;
  content: string;
  price: number;
  status?: "FOR_SALE" | "RESERVED" | "SOLD_OUT";
}

interface ProductFormProps {
  onSubmit: SubmitHandler<ProductFormData>;
  initialData?: Product; // 수정 시 초기 데이터
  isEdit?: boolean; // 수정 모드 여부
}

export default function ProductForm({
  onSubmit,
  initialData,
  isEdit = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      price: initialData?.price || 0,
      status: initialData?.status || "FOR_SALE",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-lg mx-auto"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          상품명
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: "상품명은 필수입니다." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          가격
        </label>
        <input
          id="price"
          type="number"
          {...register("price", {
            required: "가격은 필수입니다.",
            valueAsNumber: true,
            min: { value: 0, message: "가격은 0원 이상이어야 합니다." },
          })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.price && (
          <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          상세 설명
        </label>
        <textarea
          id="content"
          rows={6}
          {...register("content", { required: "상세 설명은 필수입니다." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.content && (
          <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
        )}
      </div>

      {isEdit && (
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            판매 상태
          </label>
          <select
            id="status"
            {...register("status")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="FOR_SALE">판매중</option>
            <option value="RESERVED">예약중</option>
            <option value="SOLD_OUT">판매완료</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
