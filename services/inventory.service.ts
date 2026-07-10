import api from '@/lib/api'

interface InventoryParams {
  page?: number
  limit?: number
  type?: 'in' | 'out'
  productId?: string
}

interface InventoryInData {
  productId: string
  quantity: number
  source: 'purchase' | 'manual_adjustment'
  notes?: string
}

interface InventoryOutData {
  productId: string
  quantity: number
  source: 'sale_instagram' | 'sale_facebook' | 'sale_whatsapp' | 'sale_tiktok' | 'order_confirmed'
  notes?: string
}

export const inventoryService = {
  getAll: (params?: InventoryParams) =>
    api.get('/inventory', { params }),

  registerIn: (data: InventoryInData) =>
    api.post('/inventory/in', data),

  registerOut: (data: InventoryOutData) =>
    api.post('/inventory/out', data),
}