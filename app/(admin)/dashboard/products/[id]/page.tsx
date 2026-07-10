'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import {
  ArrowLeft, Save, Upload, X, Package,
  AlertCircle, Loader2, ImagePlus
} from 'lucide-react'
import { useAdminProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useAdminProducts'
import { useCategories } from '@/hooks/useCategories'
import { uploadService } from '@/services/upload.service'

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'El precio es requerido'),
  discountPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  stock: z.coerce.number().min(0, 'El stock es requerido'),
  lowStockAlert: z.coerce.number().min(1, 'La alerta de stock es requerida'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const isNew = id === 'new'

  const { data: product, isLoading: loadingProduct } = useAdminProduct(id)
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      featured: false,
      lowStockAlert: 5,
    },
  })

  useEffect(() => {
    if (product && !isNew) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        discountPrice: product.discountPrice ?? '',
        stock: product.stock,
        lowStockAlert: product.lowStockAlert,
        categoryId: product.categoryId,
        featured: product.featured,
        active: product.active,
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(product.images ?? [])
    }
  }, [product, isNew, reset])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadService.image(file)
      setImages(prev => [...prev, url])
    } catch {
      setError('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (formData: FormData) => {
    setError('')
    try {
      const payload = {
        ...formData,
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        images,
      }

      if (isNew) {
        await createProduct.mutateAsync(payload as Parameters<typeof createProduct.mutateAsync>[0])
      } else {
        await updateProduct.mutateAsync({ id, data: payload })
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/products'), 1000)
    } catch {
      setError('Error al guardar el producto. Intenta de nuevo.')
    }
  }

  if (loadingProduct && !isNew) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNew ? 'Nuevo producto' : 'Editar producto'}
          </h1>
          <p className="text-sm text-gray-400">
            {isNew ? 'Completa los datos del producto' : 'Modifica los datos del producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Imágenes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-blue-600" />
            Imágenes
          </h2>

          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                <Image src={img} alt={`Imagen ${i + 1}`} fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                    Principal
                  </span>
                )}
              </div>
            ))}

            {/* Botón subir */}
            <label className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
              uploadingImage
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
            }`}>
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">Subir</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {images.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Package className="w-4 h-4" />
              Sin imágenes — se mostrará un placeholder
            </div>
          )}
        </div>

        {/* Información básica */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white">
            Información básica
          </h2>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ej: Camiseta Nike"
              className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.name && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              {...register('description')}
              placeholder="Descripción del producto..."
              rows={3}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId')}
              className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                errors.categoryId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.categoryId.message}
              </span>
            )}
          </div>
        </div>

        {/* Precios */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Precios</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                    errors.price ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.price && (
                <span className="text-xs text-red-500">{errors.price.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio con descuento
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...register('discountPrice')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Inventario</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                {...register('stock')}
                type="number"
                placeholder="0"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                  errors.stock ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.stock && (
                <span className="text-xs text-red-500">{errors.stock.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Alerta stock bajo <span className="text-red-500">*</span>
              </label>
              <input
                {...register('lowStockAlert')}
                type="number"
                placeholder="5"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                  errors.lowStockAlert ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.lowStockAlert && (
                <span className="text-xs text-red-500">{errors.lowStockAlert.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Opciones</h2>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Producto activo</p>
                <p className="text-xs text-gray-400">Visible en el catálogo público</p>
              </div>
              <div className="relative">
                <input {...register('active')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Producto destacado</p>
                <p className="text-xs text-gray-400">Aparece en sección especial</p>
              </div>
              <div className="relative">
                <input {...register('featured')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          </div>
        </div>

        {/* Error / éxito */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Producto guardado correctamente
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Guardando...' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}