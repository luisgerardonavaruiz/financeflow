import { auth } from '@/auth'
import BottomNav from '@/components/layout/BottomNav'
import Sidebar from '@/components/layout/Sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='min-h-screen bg-slate-950'>
      <Sidebar user={session.user} />
      <BottomNav />
      <main className='lg:ml-64 min-h-screen pb-20 lg:pb-0'>
        <div className='max-w-5xl mx-auto p-4 lg:p-8'>{children}</div>
      </main>
    </div>
  )
}
