import { Category } from './category'

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
  categoryId: string
  category?: Category
}