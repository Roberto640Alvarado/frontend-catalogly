import Link from 'next/link'
import ThemeToggle from '@/components/shared/ThemeToggle'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          Catalogly
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/cart"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            🛒 Carrito
          </Link>
        </div>
      </div>
    </nav>
  )
}