'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, ShoppingCart, Plus, Minus, Package, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const router = useRouter()
  const { items, updateQuantity, removeItem, total } = useCartStore()
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleViewCart = () => { onClose(); router.push('/cart') }
  const handleCheckout = () => { onClose(); router.push('/checkout') }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-950 z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Mi carrito</p>
              <p className="text-xs text-gray-400">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-gray-300 dark:text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega productos para comenzar
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-3">
              {items.map(({ product, quantity }) => {
                const price = product.discountPrice ?? product.price
                const subtotal = price * quantity

                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    {/* Imagen */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-100 dark:border-gray-700">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
                          {product.name}
                        </p>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Contador */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 gap-1">
                          <button
                            onClick={() => {
                              if (quantity <= 1) removeItem(product.id)
                              else updateQuantity(product.id, quantity - 1)
                            }}
                            className="w-6 h-6 rounded-md bg-white dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (quantity < product.stock)
                                updateQuantity(product.id, quantity + 1)
                            }}
                            disabled={quantity >= product.stock}
                            className="w-6 h-6 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ${subtotal.toFixed(2)}
                          </p>
                          {quantity > 1 && (
                            <p className="text-xs text-gray-400">
                              ${price.toFixed(2)} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900">
            {/* Total */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total estimado
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${total().toFixed(2)}
              </span>
            </div>

            {/* Botón pagar */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Ir a checkout
            </button>

            {/* Ver detalle */}
            <button
              onClick={handleViewCart}
              className="w-full py-2.5 rounded-xl font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver detalle del carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}