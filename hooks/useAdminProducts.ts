import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/product.service'

interface ProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (p: any) => ({
  ...p,
  id: p.id ?? p._id,
  categoryId: typeof p.categoryId === 'object' && p.categoryId !== null
    ? (p.categoryId._id ?? p.categoryId.id ?? '')
    : (p.categoryId ?? ''),
  category: p.category
    ? { ...p.category, id: p.category.id ?? p.category._id }
    : undefined,
})

export function useAdminProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const { data } = await productService.getAll(params)
      return {
        ...data,
        data: data.data.map(normalize),
      }
    },
  })
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const { data } = await productService.getById(id)
      return normalize(data)
    },
    enabled: !!id && id !== 'new',
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productService.update>[1] }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
}