export const metadata = {
  title: 'EdTech Project',
  description: 'Du an hoc tap',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}