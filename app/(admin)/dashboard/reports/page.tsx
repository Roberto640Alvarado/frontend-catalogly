'use client'

import { useState } from 'react'
import {
  BarChart2, FileSpreadsheet, FileText,
  Download, CheckCircle, Package, ShoppingBag
} from 'lucide-react'
import { reportService } from '@/services/report.service'

interface ReportCard {
  title: string
  description: string
  type: 'products' | 'orders'
  format: 'excel' | 'pdf'
  icon: React.ElementType
  color: string
}

const reports: ReportCard[] = [
  {
    title: 'Productos — Excel',
    description: 'Lista completa de productos con precios, stock y categorías',
    type: 'products',
    format: 'excel',
    icon: FileSpreadsheet,
    color: 'green',
  },
  {
    title: 'Órdenes — Excel',
    description: 'Historial de órdenes con clientes, totales y estados',
    type: 'orders',
    format: 'excel',
    icon: FileSpreadsheet,
    color: 'green',
  },
  {
    title: 'Productos — PDF',
    description: 'Catálogo de productos en formato PDF para imprimir',
    type: 'products',
    format: 'pdf',
    icon: FileText,
    color: 'red',
  },
  {
    title: 'Órdenes — PDF',
    description: 'Reporte de órdenes en formato PDF',
    type: 'orders',
    format: 'pdf',
    icon: FileText,
    color: 'red',
  },
]

const colorMap: Record<string, string> = {
  green: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
  red: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const borderMap: Record<string, string> = {
  green: 'hover:border-green-300 dark:hover:border-green-700',
  red: 'hover:border-red-300 dark:hover:border-red-700',
}

export default function ReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null)

  const handleDownload = (report: ReportCard) => {
    const key = `${report.type}-${report.format}`
    const url = report.format === 'excel'
      ? reportService.getExcelUrl(report.type)
      : reportService.getPdfUrl(report.type)

    window.open(url, '_blank')

    setDownloaded(key)
    setTimeout(() => setDownloaded(null), 3000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Descarga reportes de tu negocio en Excel o PDF
        </p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
        <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Reportes en tiempo real
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Los reportes se generan con los datos actuales de tu negocio al momento de la descarga.
          </p>
        </div>
      </div>

      {/* Sección productos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
            Productos
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {reports.filter(r => r.type === 'products').map(report => {
            const key = `${report.type}-${report.format}`
            const isDownloaded = downloaded === key

            return (
              <div
                key={key}
                className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4 transition-all ${borderMap[report.color]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[report.color]}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isDownloaded
                      ? 'bg-green-600 text-white'
                      : report.color === 'green'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar {report.format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sección órdenes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
            Órdenes
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {reports.filter(r => r.type === 'orders').map(report => {
            const key = `${report.type}-${report.format}`
            const isDownloaded = downloaded === key

            return (
              <div
                key={key}
                className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4 transition-all ${borderMap[report.color]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[report.color]}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(report)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isDownloaded
                      ? 'bg-green-600 text-white'
                      : report.color === 'green'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar {report.format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}