import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  stock: number
  lowStockAlert: number
  status: 'active' | 'inactive' | 'out_of_stock'
  featured: boolean
  active: boolean
  categoryId: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface ProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
}

interface ProductsResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (p: any): Product => ({
  ...p,
  id: p.id ?? p._id,
  categoryId: typeof p.categoryId === 'object' && p.categoryId !== null
    ? (p.categoryId._id ?? p.categoryId.id ?? '')
    : (p.categoryId ?? ''),
  category: p.category
    ? { ...p.category, id: p.category.id ?? p.category._id }
    : undefined,
})

export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<ProductsResponse>('/products', { params })
      return {
        ...data,
        data: data.data.map(normalize),
      }
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`)
      return normalize(data)
    },
    enabled: !!id,
  })
}