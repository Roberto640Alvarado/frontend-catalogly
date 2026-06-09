"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package, Plus, Minus, Tag } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cart.store";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= product.lowStockAlert;
  const discountPercent = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;

  const handleAdd = () => addItem(product);
  const handleIncrease = () => {
    if (quantity < product.stock) updateQuantity(product.id, quantity + 1);
  };
  const handleDecrease = () => {
    if (quantity <= 1) removeItem(product.id);
    else updateQuantity(product.id, quantity - 1);
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Imagen */}
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {/* Badges stock */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {outOfStock && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                Sin stock
              </span>
            )}
            {lowStock && !outOfStock && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                Últimas
              </span>
            )}
          </div>

          {discountPercent && (
            <div className="absolute top-1.5 right-1.5">
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />-{discountPercent}%
              </span>
            </div>
          )}

          {quantity > 0 && (
            <div className="absolute bottom-1.5 right-1.5">
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {quantity} en carrito
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stock */}
        <div className="text-xs">
          {outOfStock ? (
            <span className="text-red-500 font-medium">Sin stock</span>
          ) : lowStock ? (
            <span className="text-orange-500 font-medium">
              Solo {product.stock} disp.
            </span>
          ) : (
            <span className="text-green-500 font-medium">
              {product.stock} en stock
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center gap-1.5 mt-auto mb-1">
          {product.discountPrice ? (
            <>
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                ${product.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Botón / Contador */}
        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {outOfStock ? "Sin stock" : "Agregar"}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-1 py-1.5">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white text-sm w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= product.stock}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
