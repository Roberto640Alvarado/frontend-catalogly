'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Tag, Plus, Pencil, Trash2, X,
  AlertCircle, Loader2, Check
} from 'lucide-react'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useAdminCategories'
import ConfirmModal from '@/components/shared/ConfirmModal'

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
})

type FormData = z.infer<typeof schema>

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState('')

  const createForm = useForm<FormData>({ resolver: zodResolver(schema) })
  const editForm = useForm<FormData>({ resolver: zodResolver(schema) })

  const handleCreate = async (data: FormData) => {
    setError('')
    try {
      await createCategory.mutateAsync(data)
      createForm.reset()
      setShowCreateForm(false)
    } catch {
      setError('Error al crear la categoría')
    }
  }

  const handleEdit = (id: string, name: string) => {
    setEditingId(id)
    editForm.setValue('name', name)
  }

  const handleUpdate = async (data: FormData) => {
    if (!editingId) return
    setError('')
    try {
      await updateCategory.mutateAsync({ id: editingId, data })
      setEditingId(null)
    } catch {
      setError('Error al actualizar la categoría')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCategory.mutateAsync(deleteId)
      setDeleteId(null)
    } catch {
      setError('Error al eliminar la categoría')
    }
  }

  return (
    <>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados quedarán sin categoría."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {categories?.length ?? 0} categorías en total
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cancelar' : 'Nueva categoría'}
          </button>
        </div>

        {/* Formulario crear */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Nueva categoría
            </h2>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  {...createForm.register('name')}
                  placeholder="Nombre de la categoría"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                    createForm.formState.errors.name
                      ? 'border-red-400'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {createForm.formState.errors.name && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {createForm.formState.errors.name.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={createCategory.isPending}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {createCategory.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Crear
              </button>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : categories?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Tag className="w-10 h-10 text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No hay categorías
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Crear primera categoría
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3">

                  {editingId === cat.id ? (
                    /* Formulario editar inline */
                    <form
                      onSubmit={editForm.handleSubmit(handleUpdate)}
                      className="flex-1 flex gap-2"
                    >
                      <input
                        {...editForm.register('name')}
                        autoFocus
                        className="flex-1 px-3 py-1.5 rounded-xl border border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={updateCategory.isPending}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors"
                      >
                        {updateCategory.isPending
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Check className="w-3.5 h-3.5" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    /* Vista normal */
                    <>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {cat.name}
                        </p>
                        <p className="text-xs text-gray-400">{cat.slug}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(cat.id, cat.name)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}