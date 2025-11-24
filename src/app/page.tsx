'use client'

import { Building2, Users, Vote, FileText, Calendar, Shield, BarChart3, PlayCircle, MessageSquare, Settings, Bell, Mail } from 'lucide-react'

export default function ShareholderMeetingSystem() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo & Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            HỆ THỐNG ĐẠI HỘI CỔ ĐÔNG
          </h1>
          <div className="inline-block bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text">
            <p className="text-lg md:text-xl font-semibold">
              Nền tảng quản lý và vận hành đại hội cổ đông chuyên nghiệp
            </p>
          </div>
        </div>

        {/* Main Tagline */}
        <div className="max-w-4xl text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
            Quản lý toàn diện đại hội cổ đông - Từ đăng ký, biểu quyết đến biên bản
          </h2>
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => window.location.href = '/login'}
          className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 mb-16"
        >
          <span className="relative z-10">Truy cập hệ thống</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-5">
          {/* Core Meeting Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quản lý Đại hội</h3>
            <p className="text-gray-300 text-sm">
              Tạo và quản lý thông tin đại hội cổ đông, chương trình làm việc
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quản lý Cổ đông</h3>
            <p className="text-gray-300 text-sm">
              Quản lý thông tin cổ đông, phân loại và theo dõi quyền biểu quyết
            </p>
          </div>

          {/* Voting & Resolution Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Vote className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Biểu quyết & Bầu cử</h3>
            <p className="text-gray-300 text-sm">
              Hệ thống biểu quyết điện tử, bầu cử HĐQT và Ban kiểm soát
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nghị quyết & Biên bản</h3>
            <p className="text-gray-300 text-sm">
              Quản lý nghị quyết ĐHCD và biên bản cuộc họp đầy đủ
            </p>
          </div>

          {/* Proxy & Attendance Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ủy quyền & Đại diện</h3>
            <p className="text-gray-300 text-sm">
              Quản lý ủy quyền biểu quyết, xác thực người đại diện
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Báo cáo & Thống kê</h3>
            <p className="text-gray-300 text-sm">
              Báo cáo kết quả biểu quyết, thống kê tỷ lệ tham dự
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center mb-3">
              <PlayCircle className="w-5 h-5 text-cyan-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">Live Streaming</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Phát trực tiếp đại hội cho cổ đông không trực tiếp tham dự
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center mb-3">
              <MessageSquare className="w-5 h-5 text-cyan-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">Hỏi đáp & Thảo luận</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Hệ thống hỏi đáp trực tuyến giữa cổ đông và Ban lãnh đạo
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center mb-3">
              <Bell className="w-5 h-5 text-cyan-400 mr-3" />
              <h4 className="text-lg font-semibold text-white">Thông báo</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Gửi thông báo, mời họp và cập nhật thông tin đến cổ đông
            </p>
          </div>
        </div>

        {/* System Modules */}
        <div className="mt-12 max-w-4xl w-full">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Các Module Hệ Thống</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <Mail className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm">Email Templates</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <Settings className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm">Meeting Settings</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm">Meeting Minutes</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <Bell className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm">Notifications</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Hệ thống Đại hội Cổ đông - Nền tảng quản lý đại hội chuyên nghiệp toàn diện
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}