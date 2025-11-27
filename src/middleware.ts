import { NextRequest, NextResponse } from 'next/server';

// Chỉ cần xóa toàn bộ code trong file này
export async function middleware(req: NextRequest) {
  // Đã xóa nội dung ở đây
  return NextResponse.next();
}

// Không cần config nữa
export const config = {
  matcher: ['/admin/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
};
