import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'

interface InventoryParams {
  page?: number
  limit?: number
  type?: 'in' | 'out'
  productId?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (m: any) => ({ ...m, id: m.id ?? m._id })

export function useInventory(params: InventoryParams = {}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const { data } = await inventoryService.getAll(params)
      return {
        ...data,
        data: data.data.map(normalize),
      }
    },
  })
}

export function useRegisterIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.registerIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useRegisterOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.registerOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}