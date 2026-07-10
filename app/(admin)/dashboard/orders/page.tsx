'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import {
  ShoppingBag, Search, X, Clock,
  CheckCircle, XCircle, ChevronRight
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import Pagination from '@/components/shared/Pagination'

export default function OrdersPage() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch] = useDebounce(search, 300)

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    status: status || undefined,
  })

  const statusOptions = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ]

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

  const filteredOrders = debouncedSearch
    ? data?.data.filter(o =>
        o.customerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : data?.data

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Órdenes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {data?.meta.total ?? 0} órdenes en total
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs estado */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === opt.value
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No se encontraron órdenes
            </p>
          </div>
        ) : (
          <>
            {/* Header tabla desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Número</div>
              <div className="col-span-3">Cliente</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2">Fecha</div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders?.map(order => {
                const config = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = config?.icon ?? Clock
                const date = new Date(order.createdAt)
                const dateStr = date.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Número */}
                    <div className="col-span-10 md:col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {order.orderNumber}
                      </span>
                    </div>

                    {/* Cliente */}
                    <div className="hidden md:block col-span-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.customerPhone}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="hidden md:block col-span-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ${order.total?.toFixed(2)}
                      </span>
                    </div>

                    {/* Estado */}
                    <div className="hidden md:block col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config?.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config?.label}
                      </span>
                    </div>

                    {/* Fecha */}
                    <div className="hidden md:block col-span-2">
                      <span className="text-xs text-gray-400">{dateStr}</span>
                    </div>

                    {/* Flecha mobile */}
                    <div className="col-span-2 md:hidden flex justify-end items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config?.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config?.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Pagination
        currentPage={data?.meta.page ?? 1}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  )
}