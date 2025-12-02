import {supabase} from "../../../../utils/supabase/client.ts"

export default function LoginPage() {

const handleLoginGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        // Sau khi login xong, chuyển hướng về trang chủ
        redirectTo: 'http://localhost:3000/auth/callback', 
    },
    })

    if (error) console.log('Lỗi:', error.message)
}

return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
    <button onClick={handleLoginGoogle}>
        Đăng nhập bằng Google
    </button>
    </div>
)
}