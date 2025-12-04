'use client'


import { useState } from 'react'

 import { supabase } from '../../utils/supabase/client'

const mockSupabase = {
  auth: {
    signInWithOAuth: async ({ provider, options }: any) => {
      // Giả vờ đợi 1 giây như đang kết nối mạng thật
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Đang đăng nhập với ${provider}, redirect về ${options?.redirectTo}`);
      // Giả lập thành công
      return { error: null } 
    }
  }
}

// -----------------------------------------------------------

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginGoogle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Tự động lấy địa chỉ hiện tại để redirect
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      
      // Chỉ để demo hiệu ứng loading trong preview
      // Trong dự án thật, trang sẽ tự chuyển hướng nên không cần dòng này
      if (supabase === mockSupabase) {
          alert("Đã gọi hàm đăng nhập Google thành công! (Môi trường Demo)")
          setIsLoading(false)
      }

    } catch (error: any) {
      alert('Lỗi: ' + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50 items-center justify-center p-4 font-sans text-slate-800">
      
      {/* Khung chứa chính: Bo tròn và đổ bóng lớn */}
      <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl h-[600px]">
        
        {/* === CỘT TRÁI: FORM ĐĂNG NHẬP === */}
        <div className="flex w-full flex-col justify-center items-center bg-white p-10 md:w-1/2">
          
          {/* Logo / Tên dự án */}
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-xl shadow-md">
              E
            </div>
            <span className="text-xl font-bold text-gray-700">EdTech Project</span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-teal-600 text-center">
            Đăng nhập
          </h2>
          <p className="mb-8 text-sm text-gray-400 text-center">
            Chào mừng bạn quay trở lại!
          </p>

          {/* Khu vực nút Google */}
          <div className="w-full max-w-xs space-y-4">
            <button
              onClick={handleLoginGoogle}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-teal-500 hover:text-teal-600 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {isLoading ? (
                // Loading Spinner
                <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang kết nối...
                </span>
              ) : (
                <>
                    {/* Google Icon SVG */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    </svg>
                    <span>Tiếp tục với Google</span>
                </>
              )}
            </button>
            
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Hoặc</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <p className="text-center text-xs text-gray-400">
              Chưa có tài khoản? <span className="text-teal-600 font-semibold cursor-pointer hover:underline">Đăng ký ngay</span>
            </p>
          </div>
        </div>

        {/* === CỘT PHẢI: BANNER (Ẩn trên mobile) === */}
        <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-teal-500 text-white p-10 relative overflow-hidden">
          
          {/* Các hình trang trí mờ ảo (Background Blobs) */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>
          
          {/* Tam giác trang trí (CSS thuần) */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[100px] border-r-[100px] border-t-white/10 border-r-transparent"></div>
          
          <div className="relative z-10 text-center max-w-sm">
            <h2 className="mb-6 text-4xl font-bold tracking-wide drop-shadow-md">Hello, Friend!</h2>
            <p className="mb-8 text-teal-100 font-light leading-relaxed text-lg">
              Nhập thông tin cá nhân của bạn và bắt đầu hành trình học tập thú vị cùng chúng tôi ngay hôm nay.
            </p>
            
            <button className="rounded-full border-2 border-white px-10 py-2 font-bold transition-all hover:bg-white hover:text-teal-600 uppercase tracking-widest hover:shadow-lg">
              Đăng ký
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}