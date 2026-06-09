'use client'

import Link from 'next/link'
import { ShoppingCart, Store, LogIn, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { useCartStore } from '@/store/cart.store'
import SearchBar from '@/components/public/SearchBar'
import CartDrawer from '@/components/public/CartDrawer'
import { useState } from 'react'

export default function Navbar() {
  const items = useCartStore(s => s.items)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">

        {/* Desktop & Tablet */}
        <div className="hidden sm:flex container mx-auto px-4 h-16 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              Catalogly
            </span>
          </Link>

          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-lg">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            {/* Carrito — abre drawer */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:block">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
              title="Acceso administrador"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:block">Admin</span>
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          {!mobileSearchOpen ? (
            <div className="flex items-center gap-2 px-3 h-14">
              <Link href="/" className="flex items-center gap-1.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  Catalogly
                </span>
              </Link>

              <div className="flex-1" />

              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <Menu className="w-4 h-4" />
              </button>

              <ThemeToggle />

              {/* Carrito mobile — abre drawer */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                href="/login"
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 h-14">
              <div className="flex-1">
                <SearchBar />
              </div>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}