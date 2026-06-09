'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Trash2, Plus, Minus, Package, ShoppingBag,
  ArrowLeft, ShoppingCart, Tag, AlertTriangle,
  CheckCircle, Lock, ChevronRight
} from 'lucide-react'
import { useCartStore } from '@/store/cart.store'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const totalSaved = items.reduce((acc, { product, quantity }) => {
    if (product.discountPrice) {
      return acc + (product.price - product.discountPrice) * quantity
    }
    return acc
  }, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tu carrito está vacío
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Agrega productos para continuar
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi carrito</h1>
          <p className="text-sm text-gray-400">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
          </p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* Lista productos */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map(({ product, quantity }) => {
            const price = product.discountPrice ?? product.price
            const subtotal = price * quantity
            const saved = product.discountPrice
              ? (product.price - product.discountPrice) * quantity
              : 0
            const discountPercent = product.discountPrice
              ? Math.round((1 - product.discountPrice / product.price) * 100)
              : null
            const outOfStock = product.stock === 0
            const lowStock = product.stock > 0 && product.stock <= product.lowStockAlert

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Imagen */}
                  <Link href={`/products/${product.id}`} className="shrink-0">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      {discountPercent && (
                        <div className="absolute top-1 left-1">
                          <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            -{discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* Nombre y eliminar */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        {product.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        ${price.toFixed(2)}
                      </span>
                      {product.discountPrice && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            Ahorrás ${(product.price - product.discountPrice).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-1 text-xs">
                      {outOfStock ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span className="text-red-500 font-medium">Sin stock</span>
                        </>
                      ) : lowStock ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-500 font-medium">
                            Solo {product.stock} disponibles
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-500 font-medium">
                            {product.stock} en stock
                          </span>
                        </>
                      )}
                    </div>

                    {/* Contador + subtotal */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 gap-1">
                        <button
                          onClick={() => {
                            if (quantity <= 1) removeItem(product.id)
                            else updateQuantity(product.id, quantity - 1)
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${subtotal.toFixed(2)}
                        </p>
                        {saved > 0 && (
                          <p className="text-xs text-green-500">
                            Ahorrás ${saved.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Resumen del pedido
            </h2>

            {/* Desglose */}
            <div className="flex flex-col gap-2.5">
              {items.map(({ product, quantity }) => {
                const price = product.discountPrice ?? product.price
                return (
                  <div key={product.id} className="flex gap-2 items-center">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-1 truncate">
                      {product.name}
                      <span className="text-gray-400"> ×{quantity}</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                      ${(price * quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  ${total().toFixed(2)}
                </span>
              </div>
              {totalSaved > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Tag className="w-3 h-3" />
                    Descuentos
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    -${totalSaved.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${total().toFixed(2)}
                </span>
              </div>
            </div>

            {totalSaved > 0 && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 rounded-xl px-3 py-2">
                <Tag className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Ahorrás ${totalSaved.toFixed(2)} en este pedido
                </p>
              </div>
            )}

            <Link
              href="/checkout"
              className="w-full py-3 rounded-xl text-center font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Ir al checkout
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl text-center text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Seguir comprando
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Lock className="w-3 h-3" />
              Pedido seguro y protegido
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}