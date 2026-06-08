export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  notes?: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}