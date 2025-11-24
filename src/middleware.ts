// // middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify, decodeJwt } from 'jose';

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// export async function middleware(req: NextRequest) {
//   const token = req.cookies.get('access_token')?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   try {

//     const secret = new TextEncoder().encode(JWT_SECRET);
//     const { payload } = await jwtVerify(token, secret);

//     if (payload.role === 'admin') {
//       return NextResponse.next();
//     } else {
//       return NextResponse.redirect(new URL('/dashboard', req.url));
//     }

//   } catch (error: any) {
//     try {
//       const decoded = decodeJwt(token) as any;
      
//       if (decoded.role === 'admin') {
//         return NextResponse.next();
//       } else {
//         return NextResponse.redirect(new URL('/', req.url));
//       }
//     } catch (fallbackError) {
//       const response = NextResponse.redirect(new URL('/login', req.url));
//       response.cookies.delete('access_token');
      
//       return response;
//     }
//   }
// }

// export const config = {
//   matcher: ['/admin/:path*'],
// };

// app/middleware.ts (hoặc bạn có thể xóa file này nếu không cần middleware)

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
