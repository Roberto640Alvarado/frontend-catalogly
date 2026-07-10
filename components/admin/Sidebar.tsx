'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Store, LayoutDashboard, Package, Tag, ShoppingBag,
  Warehouse, BarChart2, Settings, LogOut, X, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/categories', label: 'Categorías', icon: Tag },
  { href: '/dashboard/orders', label: 'Órdenes', icon: ShoppingBag },
  { href: '/dashboard/inventory', label: 'Inventario', icon: Warehouse },
  { href: '/dashboard/reports', label: 'Reportes', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
]

interface Props {
  onClose?: () => void
}

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      logout()
      router.push('/login')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

      {/* Header sidebar */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Catalogly</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}