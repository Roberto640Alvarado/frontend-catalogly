'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Phone, FileText, Package,
  Clock, CheckCircle, XCircle, Loader2, ShoppingBag
} from 'lucide-react'
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { useState } from 'react'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: order, isLoading } = useOrder(id)
  const updateStatus = useUpdateOrderStatus()
  const [confirmAction, setConfirmAction] = useState<'confirmed' | 'cancelled' | null>(null)

  const handleUpdateStatus = async () => {
    if (!confirmAction) return
    await updateStatus.mutateAsync({ id, status: confirmAction })
    setConfirmAction(null)
  }

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      icon: Clock,
      className: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
    },
    confirmed: {
      label: 'Confirmada',
      icon: CheckCircle,
      className: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
    },
    cancelled: {
      label: 'Cancelada',
      icon: XCircle,
      className: 'bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400',
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Orden no encontrada</p>
      </div>
    )
  }

  const config = statusConfig[order.status as keyof typeof statusConfig]
  const StatusIcon = config?.icon ?? Clock
  const date = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <>
      <ConfirmModal
        isOpen={confirmAction === 'confirmed'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleUpdateStatus}
        title="Confirmar orden"
        description={`¿Estás seguro de confirmar la orden ${order.orderNumber}?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="success"
      />
      <ConfirmModal
        isOpen={confirmAction === 'cancelled'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleUpdateStatus}
        title="Cancelar orden"
        description={`¿Estás seguro de cancelar la orden ${order.orderNumber}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar orden"
        cancelText="Volver"
        variant="danger"
      />

      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {order.orderNumber}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config?.className}`}>
                <StatusIcon className="w-3 h-3" />
                {config?.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Info cliente */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Datos del cliente
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerPhone}
                  </p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Notas</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Resumen
            </h2>
            <div className="flex flex-col gap-2">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 truncate flex-1">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">
                    ${item.subtotal?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${order.total?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Productos detalle */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Productos ({order.items?.length ?? 0})
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${item.unitPrice?.toFixed(2)} c/u × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  ${item.subtotal?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        {order.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmAction('cancelled')}
              disabled={updateStatus.isPending}
              className="flex-1 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Cancelar orden
            </button>
            <button
              onClick={() => setConfirmAction('confirmed')}
              disabled={updateStatus.isPending}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {updateStatus.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />
              }
              Confirmar orden
            </button>
          </div>
        )}
      </div>
    </>
  )
}