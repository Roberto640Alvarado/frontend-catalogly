'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Warehouse, Plus, Minus, ArrowUpCircle,
  ArrowDownCircle, Package, Loader2, AlertCircle,
  X, Filter
} from 'lucide-react'
import { useInventory, useRegisterIn, useRegisterOut } from '@/hooks/useInventory'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import Pagination from '@/components/shared/Pagination'

const inSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  source: z.enum(['purchase', 'manual_adjustment']),
  notes: z.string().optional(),
})

const outSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser mayor a 0'),
  source: z.enum(['sale_instagram', 'sale_facebook', 'sale_whatsapp', 'sale_tiktok', 'order_confirmed']),
  notes: z.string().optional(),
})

type InFormData = z.infer<typeof inSchema>
type OutFormData = z.infer<typeof outSchema>

const sourceLabels: Record<string, string> = {
  purchase: 'Compra',
  manual_adjustment: 'Ajuste manual',
  sale_instagram: 'Venta Instagram',
  sale_facebook: 'Venta Facebook',
  sale_whatsapp: 'Venta WhatsApp',
  sale_tiktok: 'Venta TikTok',
  order_confirmed: 'Orden confirmada',
}

export default function InventoryPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<'in' | 'out' | ''>('')
  const [productId, setProductId] = useState('')
  const [activeForm, setActiveForm] = useState<'in' | 'out' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data, isLoading } = useInventory({
    page,
    limit: 10,
    type: type || undefined,
    productId: productId || undefined,
  })

  const { data: productsData } = useAdminProducts({ limit: 100, status: 'active' })
  const products = productsData?.data ?? []

  const registerIn = useRegisterIn()
  const registerOut = useRegisterOut()

  const inForm = useForm<InFormData>({
    resolver: zodResolver(inSchema),
    defaultValues: { source: 'purchase' },
  })

  const outForm = useForm<OutFormData>({
    resolver: zodResolver(outSchema),
    defaultValues: { source: 'sale_whatsapp' },
  })

  const handleRegisterIn = async (data: InFormData) => {
    setError('')
    try {
      await registerIn.mutateAsync(data)
      inForm.reset({ source: 'purchase' })
      setActiveForm(null)
      setSuccess('Entrada registrada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al registrar la entrada')
    }
  }

  const handleRegisterOut = async (data: OutFormData) => {
    setError('')
    try {
      await registerOut.mutateAsync(data)
      outForm.reset({ source: 'sale_whatsapp' })
      setActiveForm(null)
      setSuccess('Salida registrada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al registrar la salida')
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Historial de movimientos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveForm(activeForm === 'in' ? null : 'in')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeForm === 'in'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">Entrada</span>
          </button>
          <button
            onClick={() => setActiveForm(activeForm === 'out' ? null : 'out')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeForm === 'out'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span className="hidden sm:block">Salida</span>
          </button>
        </div>
      </div>

      {/* Formulario entrada */}
      {activeForm === 'in' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-green-600" />
              Registrar entrada
            </h2>
            <button onClick={() => setActiveForm(null)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <form onSubmit={inForm.handleSubmit(handleRegisterIn)} className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Producto <span className="text-red-500">*</span>
              </label>
              <select
                {...inForm.register('productId')}
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  inForm.formState.errors.productId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <option value="">Selecciona un producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
              {inForm.formState.errors.productId && (
                <span className="text-xs text-red-500">{inForm.formState.errors.productId.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                {...inForm.register('quantity')}
                type="number"
                min="1"
                placeholder="0"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  inForm.formState.errors.quantity ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {inForm.formState.errors.quantity && (
                <span className="text-xs text-red-500">{inForm.formState.errors.quantity.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fuente <span className="text-red-500">*</span>
              </label>
              <select
                {...inForm.register('source')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="purchase">Compra</option>
                <option value="manual_adjustment">Ajuste manual</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </label>
              <input
                {...inForm.register('notes')}
                placeholder="Notas opcionales..."
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={registerIn.isPending}
                className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {registerIn.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ArrowUpCircle className="w-4 h-4" />
                }
                Registrar entrada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario salida */}
      {activeForm === 'out' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-red-500" />
              Registrar salida
            </h2>
            <button onClick={() => setActiveForm(null)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <form onSubmit={outForm.handleSubmit(handleRegisterOut)} className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Producto <span className="text-red-500">*</span>
              </label>
              <select
                {...outForm.register('productId')}
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  outForm.formState.errors.productId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <option value="">Selecciona un producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
              {outForm.formState.errors.productId && (
                <span className="text-xs text-red-500">{outForm.formState.errors.productId.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                {...outForm.register('quantity')}
                type="number"
                min="1"
                placeholder="0"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  outForm.formState.errors.quantity ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {outForm.formState.errors.quantity && (
                <span className="text-xs text-red-500">{outForm.formState.errors.quantity.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Canal de venta <span className="text-red-500">*</span>
              </label>
              <select
                {...outForm.register('source')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="sale_whatsapp">Venta WhatsApp</option>
                <option value="sale_instagram">Venta Instagram</option>
                <option value="sale_facebook">Venta Facebook</option>
                <option value="sale_tiktok">Venta TikTok</option>
                <option value="order_confirmed">Orden confirmada</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </label>
              <input
                {...outForm.register('notes')}
                placeholder="Notas opcionales..."
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={registerOut.isPending}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {registerOut.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ArrowDownCircle className="w-4 h-4" />
                }
                Registrar salida
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <ArrowUpCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Filtrar:</span>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { value: '', label: 'Todos' },
            { value: 'in', label: 'Entradas' },
            { value: 'out', label: 'Salidas' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setType(opt.value as 'in' | 'out' | ''); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                type === opt.value
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={productId}
          onChange={e => { setProductId(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los productos</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Historial */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Warehouse className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No hay movimientos registrados
            </p>
          </div>
        ) : (
          <>
            {/* Header desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-1">Tipo</div>
              <div className="col-span-3">Producto</div>
              <div className="col-span-2">Cantidad</div>
              <div className="col-span-3">Fuente</div>
              <div className="col-span-3">Fecha</div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {data?.data.map(movement => {
                const isIn = movement.type === 'in'
                const date = new Date(movement.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })

                return (
                  <div
                    key={movement.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Tipo */}
                    <div className="col-span-2 md:col-span-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isIn
                          ? 'bg-green-50 dark:bg-green-950'
                          : 'bg-red-50 dark:bg-red-950'
                      }`}>
                        {isIn
                          ? <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          : <ArrowDownCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                        }
                      </div>
                    </div>

                    {/* Producto */}
                    <div className="col-span-7 md:col-span-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {movement.productName}
                      </p>
                      {movement.notes && (
                        <p className="text-xs text-gray-400 truncate">{movement.notes}</p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="hidden md:block col-span-2">
                      <span className={`text-sm font-bold ${
                        isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {isIn ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>

                    {/* Fuente */}
                    <div className="hidden md:block col-span-3">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        {sourceLabels[movement.source] ?? movement.source}
                      </span>
                    </div>

                    {/* Fecha */}
                    <div className="hidden md:block col-span-3">
                      <span className="text-xs text-gray-400">{date}</span>
                    </div>

                    {/* Mobile — cantidad */}
                    <div className="col-span-3 md:hidden flex justify-end">
                      <span className={`text-sm font-bold ${
                        isIn ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {isIn ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>
                  </div>
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