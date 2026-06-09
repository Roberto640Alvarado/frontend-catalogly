'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/store/cart.store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Business } from '@/types/business'
import ConfirmModal from '@/components/shared/ConfirmModal'
import {
  User, Phone, FileText, ShoppingCart, Package,
  ArrowLeft, CheckCircle, Home, MessageCircle, Tag
} from 'lucide-react'

const schema = z.object({
  customerName: z.string().min(2, 'El nombre es requerido'),
  customerPhone: z.string().min(8, 'El teléfono es requerido'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [order, setOrder] = useState<{ orderNumber: string; total: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data } = await api.get<Business>('/business')
      return data
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (items.length === 0 && !order) {
    router.push('/cart')
    return null
  }

  const onSubmit = (formData: FormData) => {
    setPendingData(formData)
    setShowConfirm(true)
  }

  const confirmOrder = async () => {
    if (!pendingData) return
    setIsSubmitting(true)
    setError('')
    try {
      const { data } = await api.post('/orders', {
        ...pendingData,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      })
      setOrder({ orderNumber: data.orderNumber, total: total() })
      clearCart()
    } catch {
      setError('Hubo un error al confirmar el pedido. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de éxito
  if (order) {
    const whatsapp = business?.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    const message = encodeURIComponent(
      `Hola! Hice el pedido ${order.orderNumber} por $${order.total.toFixed(2)}`
    )
    const waLink = `https://wa.me/${whatsapp}?text=${message}`

    return (
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-12 text-center px-4">
        {/* Icono éxito */}
        <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 44 44" fill="none">
            <path d="M15.4808 40.4992L12.0608 34.7392L5.58078 33.2992L6.21078 26.6392L1.80078 21.5992L6.21078 16.5592L5.58078 9.89922L12.0608 8.45922L15.4808 2.69922L21.6008 5.30922L27.7208 2.69922L31.1408 8.45922L37.6208 9.89922L36.9908 16.5592L41.4008 21.5992L36.9908 26.6392L37.6208 33.2992L31.1408 34.7392L27.7208 40.4992L21.6008 37.8892L15.4808 40.4992ZM19.7108 27.9892L29.8808 17.8192L27.3608 15.2092L19.7108 22.8592L15.8408 19.0792L13.3208 21.5992L19.7108 27.9892Z" fill="#16a34a"/>
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Orden <span className="text-green-600">enviada!</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tu pedido ha sido creado con éxito
          </p>
        </div>

        {/* Número de orden */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Número de orden</span>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total pagado</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Info WhatsApp */}
        <div className="w-full bg-green-50 dark:bg-green-950 rounded-2xl p-4 flex items-start gap-3 text-left">
          <MessageCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Confirma tu pedido por WhatsApp para que podamos procesarlo lo antes posible.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => window.open(waLink, '_blank')}
            className="w-full py-3 rounded-xl font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Confirmar por WhatsApp
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-xl font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const orderTotal = total()
  const totalSaved = items.reduce((acc, { product, quantity }) => {
    if (product.discountPrice) {
      return acc + (product.price - product.discountPrice) * quantity
    }
    return acc
  }, 0)

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmOrder}
        title="Confirmar número de teléfono"
        description={`¿Estás seguro de continuar con el número ${pendingData?.customerPhone}?`}
        confirmText="Confirmar pedido"
        cancelText="Cancelar"
        variant="warning"
      />

      <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
            <p className="text-sm text-gray-400">Completa tu pedido</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Datos del cliente
                </h2>

                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Nombre completo
                  </label>
                  <input
                    {...register('customerName')}
                    placeholder="Ej: Juan Pérez"
                    className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.customerName
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.customerName && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      {errors.customerName.message}
                    </span>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Teléfono
                  </label>
                  <input
                    {...register('customerPhone')}
                    placeholder="Ej: +503 7777 7777"
                    className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.customerPhone
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.customerPhone && (
                    <span className="text-xs text-red-500">
                      {errors.customerPhone.message}
                    </span>
                  )}
                </div>

                {/* Notas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    Notas <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    {...register('notes')}
                    placeholder="Instrucciones especiales, dirección de entrega, etc."
                    rows={3}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {isSubmitting ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                Resumen
              </h2>

              {/* Productos */}
              <div className="flex flex-col gap-3">
                {items.map(({ product, quantity }) => {
                  const price = product.discountPrice ?? product.price
                  return (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ${price.toFixed(2)} × {quantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">
                        ${(price * quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
                {totalSaved > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Tag className="w-3 h-3" />
                      Descuentos
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -${totalSaved.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {totalSaved > 0 && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 rounded-xl px-3 py-2">
                  <Tag className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Ahorrás ${totalSaved.toFixed(2)} en este pedido
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <CheckCircle className="w-3 h-3" />
                Pedido seguro y protegido
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}