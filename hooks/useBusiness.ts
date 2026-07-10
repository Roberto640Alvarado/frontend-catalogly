import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessService } from '@/services/business.service'

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data } = await businessService.get()
      return data
    },
  })
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: businessService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
    },
  })
}