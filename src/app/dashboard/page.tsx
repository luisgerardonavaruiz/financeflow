'use client'

import {
  EXPENSE_CATEGORIES,
  EXPENSE_TYPE_COLORS,
  EXPENSE_TYPES,
} from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Expense } from '@prisma/client'
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardData {
  presupuesto: { income: number } | null
  ultimosGastos: Expense[]
  resumen: {
    totalGastado: number
    totalRiesgo: number
    disponible: number
    porcentajeGastado: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const currentMonth = new Date().toLocaleString('es-MX', {
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Resumen del mes</h1>
        <p className='text-slate-400 mt-1 capitalize'>{currentMonth}</p>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            <StatCard
              label='Presupuesto'
              value={formatCurrency(data?.presupuesto?.income ?? 0)}
              icon={<Wallet size={20} />}
              color='blue'
            />
            <StatCard
              label='Gastado'
              value={formatCurrency(data?.resumen.totalGastado ?? 0)}
              icon={<TrendingDown size={20} />}
              color='red'
            />
            <StatCard
              label='Disponible'
              value={formatCurrency(data?.resumen.disponible ?? 0)}
              icon={<TrendingUp size={20} />}
              color={(data?.resumen.disponible ?? 0) >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label='En riesgo'
              value={formatCurrency(data?.resumen.totalRiesgo ?? 0)}
              icon={<AlertTriangle size={20} />}
              color='yellow'
            />
          </div>

          {data?.presupuesto && (
            <div className='bg-slate-900 rounded-2xl p-5 border border-slate-800'>
              <div className='flex justify-between items-center mb-3'>
                <h2 className='text-sm font-medium text-slate-400'>
                  Progreso del mes
                </h2>
                <span className='text-sm font-semibold text-white'>
                  {data.resumen.porcentajeGastado.toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-slate-800 rounded-full h-3'>
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    data.resumen.porcentajeGastado >= 90
                      ? 'bg-red-500'
                      : data.resumen.porcentajeGastado >= 70
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${data.resumen.porcentajeGastado}%` }}
                />
              </div>
              <div className='flex justify-between mt-2'>
                <span className='text-xs text-slate-500'>
                  {formatCurrency(data.resumen.totalGastado)} gastado
                </span>
                <span className='text-xs text-slate-500'>
                  {formatCurrency(data.presupuesto.income)} total
                </span>
              </div>
            </div>
          )}

          {!data?.presupuesto && (
            <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800 border-dashed'>
              <p className='text-slate-500 text-sm text-center'>
                No has registrado tu presupuesto este mes.{' '}
                <Link
                  href='/dashboard/presupuesto'
                  className='text-emerald-400 hover:text-emerald-300 font-medium'
                >
                  Registrarlo ahora →
                </Link>
              </p>
            </div>
          )}

          <div className='bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'>
            <div className='flex items-center justify-between p-5 border-b border-slate-800'>
              <h2 className='text-base font-semibold text-white'>
                Últimos gastos
              </h2>
              <Link
                href='/dashboard/gastos'
                className='text-emerald-400 text-sm hover:text-emerald-300 font-medium'
              >
                Ver todos →
              </Link>
            </div>

            {data?.ultimosGastos.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 gap-3'>
                <p className='text-slate-500 text-sm'>
                  No hay gastos registrados este mes
                </p>
                <Link
                  href='/dashboard/gastos'
                  className='text-emerald-400 text-sm hover:text-emerald-300 font-medium'
                >
                  Registrar primer gasto →
                </Link>
              </div>
            ) : (
              <div className='divide-y divide-slate-800'>
                {data?.ultimosGastos.map((gasto) => (
                  <div
                    key={gasto.id}
                    className='flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='text-white font-medium truncate'>
                        {gasto.description}
                      </p>
                      <div className='flex items-center gap-2 mt-1 flex-wrap'>
                        <span className='text-slate-500 text-xs'>
                          {formatDate(gasto.date)}
                        </span>
                        <span className='text-slate-600 text-xs'>·</span>
                        <span className='text-slate-400 text-xs'>
                          {
                            EXPENSE_CATEGORIES[
                              gasto.category as keyof typeof EXPENSE_CATEGORIES
                            ]
                          }
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium
                            ${EXPENSE_TYPE_COLORS[gasto.type as keyof typeof EXPENSE_TYPE_COLORS]}`}
                        >
                          {
                            EXPENSE_TYPES[
                              gasto.type as keyof typeof EXPENSE_TYPES
                            ]
                          }
                        </span>
                      </div>
                    </div>
                    <p className='text-white font-semibold whitespace-nowrap'>
                      {formatCurrency(gasto.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
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
        <p className='text-white text-lg font-bold mt-0.5 truncate'>{value}</p>
      </div>
    </div>
  )
}
