import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'

interface OrdersParams {
  page?: number
  limit?: number
  status?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (o: any) => ({
  ...o,
  id: o.id ?? o._id,
})

export function useOrders(params: OrdersParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await orderService.getAll(params)
      return {
        ...data,
        data: data.data.map(normalize),
      }
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await orderService.getById(id)
      return normalize(data)
    },
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}