import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Category } from '@/types/category'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (c: any): Category => ({ ...c, id: c.id ?? c._id })

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data.map(normalize)
    },
  })
}