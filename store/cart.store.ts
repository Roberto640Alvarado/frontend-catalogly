import { create } from 'zustand'
import { Product } from '@/types/product'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    const items = get().items
    const existing = items.find(i => i.product.id === product.id)
    if (existing) {
      set({
        items: items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      })
    } else {
      set({ items: [...items, { product, quantity }] })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((acc, i) => {
      const price = i.product.discountPrice ?? i.product.price
      return acc + price * i.quantity
    }, 0),
}))