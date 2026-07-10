import api from '@/lib/api'

export const uploadService = {
  image: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.url
  },

  deleteImage: (publicId: string) =>
    api.delete(`/uploads/image/${publicId}`),
}