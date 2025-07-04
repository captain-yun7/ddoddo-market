import Link from "next/link";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          {/* 이미지가 있다면 <img /> 태그 사용 */}
          {product.userProfileImageUrl ? (
            <img
              src={product.userProfileImageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500">이미지 없음</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{product.title}</h3>
          <p className="text-gray-600 mt-1">{formatPrice(product.price)}</p>
          <div className="text-sm text-gray-500 mt-2">
            {/* product.user.nickname 대신 product.userNickname 사용 */}
            <span>{product.userNickname}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
