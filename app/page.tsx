import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Chào mừng đến với EdTech Project</h1>
      <p>Trang web đã chạy thành công!</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Bấm vào đây để đến trang Đăng nhập
        </Link>
      </div>
    </div>
  )
}