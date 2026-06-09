'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { X, Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import ProductCard from '@/components/public/ProductCard'
import Pagination from '@/components/shared/Pagination'
import { useDebounce } from 'use-debounce'

export default function CatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? '')
  const [page, setPage] = useState(1)
  const [debouncedSearch] = useDebounce(search, 300)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get('search') ?? '')
    setCategoryId(searchParams.get('categoryId') ?? '')
    setPage(1)
  }, [searchParams])

  const { data, isLoading } = useProducts({
    page,
    limit: 12,
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    status: 'active',
  })

  const { data: categories } = useCategories()

  const allCategories = [
    { id: '', name: 'Todas' },
    ...(categories ?? []),
  ]

  const hasFilters = search !== '' || categoryId !== ''

  const navigateTo = (newSearch: string, newCategoryId: string) => {
    const params = new URLSearchParams()
    if (newSearch) params.set('search', newSearch)
    if (newCategoryId) params.set('categoryId', newCategoryId)
    router.push(params.toString() ? `/?${params.toString()}` : '/')
  }

  const clearFilters = () => router.push('/')

  return (
    <div className="flex gap-6 items-start">

      {/* Sidebar — desktop, se alinea con las cards */}
      <aside className="hidden lg:flex flex-col gap-3 w-56 shrink-0 mt-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Categoría
          </p>
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
            {allCategories.map(cat => (
              <button
                key={cat.id === '' ? 'all' : cat.id}
                onClick={() => navigateTo(search, cat.id)}
                className={`flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-left transition-colors ${
                  categoryId === cat.id
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  categoryId === cat.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {categoryId === cat.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
          >
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Header — título y cantidad en la misma fila */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {search
              ? `Resultados para "${search}"`
              : categoryId
                ? allCategories.find(c => c.id === categoryId)?.name
                : 'Todos los productos'}
          </h1>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline lg:hidden"
              >
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
            {data && (
              <span className="text-sm text-gray-400">
                {data.meta.total} productos
              </span>
            )}
          </div>
        </div>

        {/* Chips categorías — mobile */}
        <div className="flex gap-2 flex-wrap lg:hidden">
          {allCategories.map(cat => (
            <button
              key={cat.id === '' ? 'all' : cat.id}
              onClick={() => navigateTo(search, cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryId === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`sk-${i}`} className="flex flex-col gap-2">
                <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse w-3/4" />
                <div className="h-3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse w-1/2" />
                <div className="h-8 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No se encontraron productos
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Intenta con otro término o categoría
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {data?.data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={data?.meta.page ?? 1}
          totalPages={data?.meta.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}