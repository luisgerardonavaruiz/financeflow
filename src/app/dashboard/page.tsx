import { auth } from '@/auth'
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const currentMonth = new Date().toLocaleString('es-MX', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white capitalize'>
          Hola, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p className='text-slate-400 mt-1 capitalize'>{currentMonth}</p>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          label='Presupuesto'
          value='$0.00'
          icon={<Wallet size={20} />}
          color='blue'
        />
        <StatCard
          label='Gastado'
          value='$0.00'
          icon={<TrendingDown size={20} />}
          color='red'
        />
        <StatCard
          label='Disponible'
          value='$0.00'
          icon={<TrendingUp size={20} />}
          color='green'
        />
        <StatCard
          label='En riesgo'
          value='$0.00'
          icon={<AlertTriangle size={20} />}
          color='yellow'
        />
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <h2 className='text-lg font-semibold text-white mb-4'>
          Últimos gastos
        </h2>
        <div className='flex flex-col items-center justify-center py-12 gap-3'>
          <p className='text-slate-500 text-sm'>No hay gastos registrados</p>

          <a
            href='/dashboard/gastos'
            className='text-emerald-400 text-sm hover:text-emerald-300 font-medium'
          >
            Registrar primer gasto →
          </a>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'red' | 'green' | 'yellow'
}

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className='bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3'>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className='text-slate-400 text-xs font-medium'>{label}</p>
        <p className='text-white text-xl font-bold mt-0.5'>{value}</p>
      </div>
    </div>
  )
}
