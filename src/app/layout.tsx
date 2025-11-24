// src/app/layout.tsx
'use client'

import { ReactNode } from 'react'
import '@/styles/globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppContent from '@/components/layout/AppContent'
import dayjs from '@/utils/dayjs'

// ✅ Set dayjs locale
import 'dayjs/locale/vi'
dayjs.locale('vi')

// ✅ Khởi tạo QueryClient một lần duy nhất
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Cache 1 phút
      refetchOnWindowFocus: false, // Không refetch khi focus window
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <QueryClientProvider client={queryClient}>
            <AppContent>
              {children}
            </AppContent>
        </QueryClientProvider>
      </body>
    </html>
  )
}