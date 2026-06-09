'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, ChevronDown, Package } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import Image from 'next/image'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: categories } = useCategories()
  const allCategories = [{ id: '', name: 'Todos' }, ...(categories ?? [])]
  const selectedCategory = allCategories.find(c => c.id === categoryId)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get('search') ?? '')
    setCategoryId(searchParams.get('categoryId') ?? '')
  }, [searchParams])

  const { data: suggestions, isLoading } = useProducts({
    search: debouncedQuery,
    limit: 5,
    status: 'active',
    categoryId: categoryId || undefined,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setShowCategoryMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = (q: string, catId: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('search', q.trim())
    if (catId) params.set('categoryId', catId)
    router.push(params.toString() ? `/?${params.toString()}` : '/')
    setShowDropdown(false)
    setShowCategoryMenu(false)
    inputRef.current?.blur()
  }

  const handleSearch = () => navigate(query, categoryId)

  const handleSelectCategory = (catId: string) => {
    setCategoryId(catId)
    setShowCategoryMenu(false)
    navigate(query, catId)
  }

  const handleSelectSuggestion = (productName: string) => {
    setQuery(productName)
    navigate(productName, categoryId)
  }

  const handleClear = () => {
    setQuery('')
    navigate('', categoryId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const showSuggestions = showDropdown && debouncedQuery.length >= 2

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className={`flex items-center bg-white dark:bg-gray-800 border-2 transition-colors rounded-2xl ${
        showDropdown ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Selector categoría */}
        <div className="relative">
          <button
            onClick={() => { setShowCategoryMenu(v => !v); setShowDropdown(false) }}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-r border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            {selectedCategory?.name ?? 'Todos'}
            <ChevronDown className={`w-3 h-3 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto py-1">
                {allCategories.map(cat => (
                  <button
                    key={cat.id === '' ? 'all' : cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                      categoryId === cat.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {cat.name}
                    {categoryId === cat.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 flex items-center px-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar productos..."
            className="flex-1 px-2 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={handleClear}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Botón buscar */}
        <button
          onClick={handleSearch}
          className="m-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown sugerencias */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : suggestions?.data.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No se encontraron productos
            </div>
          ) : (
            <div className="py-1">
              {suggestions?.data.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelectSuggestion(product.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 relative">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate">{product.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    ${(product.discountPrice ?? product.price).toFixed(2)}
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                <button
                  onClick={handleSearch}
                  className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                >
                  Ver todos los resultados de &quot;{query}&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}