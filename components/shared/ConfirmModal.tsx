'use client'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'success'
}

const icons = {
  success: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.4808 40.4992L12.0608 34.7392L5.58078 33.2992L6.21078 26.6392L1.80078 21.5992L6.21078 16.5592L5.58078 9.89922L12.0608 8.45922L15.4808 2.69922L21.6008 5.30922L27.7208 2.69922L31.1408 8.45922L37.6208 9.89922L36.9908 16.5592L41.4008 21.5992L36.9908 26.6392L37.6208 33.2992L31.1408 34.7392L27.7208 40.4992L21.6008 37.8892L15.4808 40.4992ZM19.7108 27.9892L29.8808 17.8192L27.3608 15.2092L19.7108 22.8592L15.8408 19.0792L13.3208 21.5992L19.7108 27.9892Z" fill="#1A5656"/>
    </svg>
  ),
  warning: (
    <svg width="44" height="44" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.8333 61.5H65.1666L44.9999 26.6667L24.8333 61.5ZM46.8333 56H43.1666V52.3333H46.8333V56ZM46.8333 48.6667H43.1666V41.3333H46.8333V48.6667Z" fill="#FFB745"/>
    </svg>
  ),
  danger: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2C11 2 2 11 2 22s9 20 20 20 20-9 20-20S33 2 22 2zm2 30h-4v-4h4v4zm0-8h-4V10h4v14z" fill="#EF4444"/>
    </svg>
  ),
}

const bgColors = {
  success: 'bg-green-50',
  warning: 'bg-orange-50',
  danger: 'bg-red-50',
}

const confirmColors = {
  success: 'bg-blue-600 hover:bg-blue-700 text-white',
  warning: 'bg-blue-600 hover:bg-blue-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  variant = 'warning',
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>

        {/* Icono */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${bgColors[variant]}`}>
          {icons[variant]}
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${confirmColors[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}