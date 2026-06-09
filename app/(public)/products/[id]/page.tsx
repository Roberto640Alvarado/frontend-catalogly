'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cart.store'
import {
  ShoppingCart, Package, Plus, Minus, Share2,
  ArrowLeft, Tag, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: product, isLoading } = useProduct(id)
  const { items, addItem, updateQuantity, removeItem } = useCartStore()
  const [mainImage, setMainImage] = useState(0)
  const [copied, setCopied] = useState(false)

  const cartItem = items.find(i => i.product.id === id)
  const quantity = cartItem?.quantity ?? 0

  const categoryId = typeof product?.categoryId === 'string' ? product.categoryId : undefined

  const { data: related } = useProducts({
    categoryId,
    limit: 5,
    status: 'active',
  })

  const relatedProducts = related?.data.filter(p => p.id !== id) ?? []

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: product?.name, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleIncrease = () => {
    if (!product) return
    if (quantity === 0) addItem(product, 1)
    else if (quantity < product.stock) updateQuantity(product.id, quantity + 1)
  }

  const handleDecrease = () => {
    if (quantity <= 1) removeItem(id)
    else updateQuantity(id, quantity - 1)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Package className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Producto no encontrado</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= product.lowStockAlert
  const discountPercent = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        {product.category && (
          <>
            <span>/</span>
            <span className="text-gray-500 dark:text-gray-400">{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-200 font-medium truncate">
          {product.name}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Galería */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {product.images?.[mainImage] ? (
              <Image
                src={product.images[mainImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            {discountPercent && (
              <div className="absolute top-3 left-3">
                <span className="bg-orange-500 text-white text-sm px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  -{discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    mainImage === i
                      ? 'border-blue-600 shadow-md scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {product.category && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-sm font-medium shrink-0"
            >
              <Share2 className="w-4 h-4" />
              {copied ? '¡Copiado!' : 'Compartir'}
            </button>
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {outOfStock ? (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-medium">Sin stock disponible</span>
              </>
            ) : lowStock ? (
              <>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 font-medium">
                  Solo quedan {product.stock} unidades
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-medium">
                  En stock ({product.stock} disponibles)
                </span>
              </>
            )}
          </div>

          {/* Contador */}
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Cantidad:
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-1 py-1 gap-2">
                <button
                  onClick={handleDecrease}
                  disabled={quantity === 0}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
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
              {quantity > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {quantity} en carrito
                </span>
              )}
            </div>
          )}

          {/* Botón ir al carrito */}
          <button
            onClick={() => router.push('/cart')}
            disabled={outOfStock || quantity === 0}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {quantity > 0 ? `Ir al carrito (${quantity})` : 'Agrega productos primero'}
          </button>
        </div>
      </div>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedProducts.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}