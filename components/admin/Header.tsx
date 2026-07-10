'use client'

import { Menu, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import ThemeToggle from '@/components/shared/ThemeToggle'

interface Props {
  onMenuClick: () => void
  title?: string
}

export default function Header({ onMenuClick, title }: Props) {
  const user = useAuthStore(s => s.user)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">

      <div className="flex items-center gap-3">
        {/* Menú hamburguesa — mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notificaciones */}
        <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar usuario */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
              {user?.name ?? 'Admin'}
            </span>
            <span className="text-xs text-gray-400 leading-tight">
              {user?.email ?? ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}