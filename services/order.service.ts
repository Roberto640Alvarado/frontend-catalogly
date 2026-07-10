import api from '@/lib/api'

interface OrderParams {
  page?: number
  limit?: number
  status?: string
}

interface CreateOrderData {
  customerName: string
  customerPhone: string
  notes?: string
  items: {
    productId: string
    quantity: number
  }[]
}

export const orderService = {
  getAll: (params?: OrderParams) =>
    api.get('/orders', { params }),

  getById: (id: string) =>
    api.get(`/orders/${id}`),

  create: (data: CreateOrderData) =>
    api.post('/orders', data),

  updateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') =>
    api.patch(`/orders/${id}/status`, { status }),
}