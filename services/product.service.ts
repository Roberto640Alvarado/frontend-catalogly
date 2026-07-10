import api from '@/lib/api'

interface ProductParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  status?: string
}

interface CreateProductData {
  name: string
  description?: string
  price: number
  discountPrice?: number
  images?: string[]
  stock: number
  lowStockAlert: number
  categoryId: string
  featured?: boolean
  active?: boolean
}

export const productService = {
  getAll: (params?: ProductParams) =>
    api.get('/products', { params }),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  create: (data: CreateProductData) =>
    api.post('/products', data),

  update: (id: string, data: Partial<CreateProductData>) =>
    api.patch(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
}