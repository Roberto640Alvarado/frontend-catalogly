const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const reportService = {
  getExcelUrl: (type: 'products' | 'orders') =>
    `${BASE_URL}/reports/excel?type=${type}`,

  getPdfUrl: (type: 'products' | 'orders') =>
    `${BASE_URL}/reports/pdf?type=${type}`,
}