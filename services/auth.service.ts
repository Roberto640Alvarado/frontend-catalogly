import api from '@/lib/api'

interface LoginData {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    _id?: string
    id?: string
    name: string
    email: string
    role: string
    mustChangePassword: boolean
  }
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const authService = {
  login: (data: LoginData) =>
    api.post<LoginResponse>('/auth/login', data),

  refresh: () =>
    api.post('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  changePassword: (data: ChangePasswordData) =>
    api.patch('/users/change-password', data),
}