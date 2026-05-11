import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='min-h-screen bg-slate-900 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-white'>
          ¡Hola, {session.user.name}!
        </h1>
        <p className='text-slate-400 mt-2'>Dashboard en construcción</p>
      </div>
    </div>
  )
}
