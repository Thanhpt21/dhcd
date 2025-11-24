// src/app/admin/resolutions/[id]/options/loading.tsx
import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" tip="Đang tải..." />
    </div>
  )
}