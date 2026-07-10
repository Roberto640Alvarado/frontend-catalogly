'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import {
  Plus, Search, Package, Pencil, Trash2,
  AlertTriangle, XCircle, CheckCircle, X
} from 'lucide-react'
import { useAdminProducts, useDeleteProduct } from '@/hooks/useAdminProducts'
import { useCategories } from '@/hooks/useCategories'
import Pagination from '@/components/shared/Pagination'
import ConfirmModal from '@/components/shared/ConfirmModal'

export default function ProductsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [debouncedSearch] = useDebounce(search, 300)

  const { data, isLoading } = useAdminProducts({
    page,
    limit: 10,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    status: status || undefined,
  })

  const { data: categories } = useCategories()
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteProduct.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'out_of_stock', label: 'Sin stock' },
  ]

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {data?.meta.total ?? 0} productos en total
            </p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">Nuevo producto</span>
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
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

          {/* Categoría */}
          <select
            value={categoryId}
            onChange={e => { setCategoryId(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No se encontraron productos
              </p>
              <Link
                href="/dashboard/products/new"
                className="text-sm text-blue-600 hover:underline"
              >
                Crear primer producto
              </Link>
            </div>
          ) : (
            <>
              {/* Header tabla — desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2">Precio</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-1 text-right">Acciones</div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                {data?.data.map(product => {
                  const outOfStock = product.stock === 0
                  const lowStock = product.stock > 0 && product.stock <= product.lowStockAlert

                  return (
                    <div
                      key={product.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Producto */}
                      <div className="col-span-10 md:col-span-5 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {product.name}
                          </p>
                          {product.category && (
                            <p className="text-xs text-gray-400 truncate">
                              {product.category.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="hidden md:block col-span-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${product.discountPrice?.toFixed(2) ?? product.price.toFixed(2)}
                        </p>
                        {product.discountPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="hidden md:flex col-span-2 items-center gap-1.5">
                        {outOfStock ? (
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : lowStock ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          outOfStock ? 'text-red-500' : lowStock ? 'text-orange-500' : 'text-green-500'
                        }`}>
                          {product.stock}
                        </span>
                      </div>

                      {/* Estado */}
                      <div className="hidden md:block col-span-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                            : product.status === 'inactive'
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              : 'bg-red-100 dark:bg-red-950 text-red-500'
                        }`}>
                          {product.status === 'active' ? 'Activo'
                            : product.status === 'inactive' ? 'Inactivo'
                            : 'Sin stock'}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
    </>
  )
}