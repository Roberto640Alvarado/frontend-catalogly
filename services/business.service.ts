import api from '@/lib/api'

interface BusinessData {
  name?: string
  description?: string
  logo?: string
  banner?: string
  whatsapp?: string
  email?: string
  address?: string
  instagram?: string
  facebook?: string
  tiktok?: string
}

export const businessService = {
  get: () =>
    api.get('/business'),

  update: (data: BusinessData) =>
    api.patch('/business', data),
}