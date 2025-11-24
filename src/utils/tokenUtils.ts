import Cookies from 'js-cookie';

// Lưu token vào cookie
export const saveToken = (token: string) => {
  // Lưu token vào cookie với các thuộc tính bảo mật
  Cookies.set('access_token', token, {
    expires: 7, // Token sẽ hết hạn sau 7 ngày
    secure: process.env.NODE_ENV === 'production', // Chỉ dùng khi trang được bảo vệ bằng HTTPS
    sameSite: 'Strict', // Giảm rủi ro CSRF
  });
};

// Lấy token từ cookie
export const getToken = (): string | undefined => {
  return Cookies.get('access_token'); // Lấy token từ cookie
};

// Xóa token khỏi cookie
export const removeToken = () => {
  Cookies.remove('access_token'); // Xóa token khỏi cookie
};
