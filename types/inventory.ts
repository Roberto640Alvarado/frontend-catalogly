export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out'
  quantity: number
  source: string
  notes?: string
  createdAt: string
}