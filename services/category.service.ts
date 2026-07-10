import api from '@/lib/api'

interface CategoryData {
  name: string
}

export const categoryService = {
  getAll: () =>
    api.get('/categories'),

  create: (data: CategoryData) =>
    api.post('/categories', data),

  update: (id: string, data: CategoryData) =>
    api.patch(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
}