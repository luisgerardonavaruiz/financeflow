'use client'

import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Presupuesto {
  id: string
  month: number
  year: number
  income: number
}

interface ResumenGastos {
  total: number
  necessary: number
  unnecessary: number
  risk: number
}

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export default function PresupuestoPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [resumen, setResumen] = useState<ResumenGastos>({
    total: 0,
    necessary: 0,
    unnecessary: 0,
    risk: 0,
  })
  const [income, setIncome] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [presupuestoRes, gastosRes] = await Promise.all([
      fetch(`/api/presupuesto?month=${month}&year=${year}`),
      fetch(`/api/gastos?month=${month}&year=${year}`),
    ])

    const presupuestoData = await presupuestoRes.json()
    const gastosData = await gastosRes.json()

    setPresupuesto(presupuestoData)
    setIncome(presupuestoData?.income?.toString() ?? '')

    if (Array.isArray(gastosData)) {
      const resumenCalculado = gastosData.reduce(
        (acc: ResumenGastos, gasto: { type: string; amount: number }) => {
          acc.total += gasto.amount
          if (gasto.type === 'NECESSARY') acc.necessary += gasto.amount
          if (gasto.type === 'UNNECESSARY') acc.unnecessary += gasto.amount
          if (gasto.type === 'RISK') acc.risk += gasto.amount
          return acc
        },
        { total: 0, necessary: 0, unnecessary: 0, risk: 0 },
      )
      setResumen(resumenCalculado)
    }

    setLoading(false)
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    if (!income || parseFloat(income) <= 0) return
    setSaving(true)

    const res = await fetch('/api/presupuesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month,
        year,
        income: parseFloat(income),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setPresupuesto(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const disponible = (presupuesto?.income ?? 0) - resumen.total
  const porcentajeGastado = presupuesto?.income
    ? Math.min((resumen.total / presupuesto.income) * 100, 100)
    : 0

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Presupuesto</h1>
        <p className='text-slate-400 text-sm mt-1'>
          Registra cuánto dinero tienes disponible cada mes
        </p>
      </div>

      <div className='flex gap-3 py-1'>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className='px-3 py-2 rounded-lg bg-slate-900 border border-slate-800
            text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 shrink-0'
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className='px-3 py-2 rounded-lg bg-slate-900 border border-slate-800
            text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 shrink-0'
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <h2 className='text-lg font-semibold text-white mb-4'>
          Ingreso disponible — {months[month - 1]} {year}
        </h2>
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm'>
              $
            </span>
            <input
              type='number'
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder='0.00'
              className='w-full pl-8 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700
        text-white placeholder-slate-500 outline-none transition-all text-lg
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !income || parseFloat(income) <= 0}
            className='w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600
      text-white rounded-lg text-sm font-medium transition-colors shrink-0
      disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {saving ? (
              <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block mx-auto' />
            ) : saved ? (
              '¡Guardado!'
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            <StatCard
              label='Ingreso'
              value={formatCurrency(presupuesto?.income ?? 0)}
              icon={<Wallet size={20} />}
              color='blue'
            />
            <StatCard
              label='Gastado'
              value={formatCurrency(resumen.total)}
              icon={<TrendingDown size={20} />}
              color='red'
            />
            <StatCard
              label='Disponible'
              value={formatCurrency(disponible)}
              icon={<TrendingUp size={20} />}
              color={disponible >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label='En riesgo'
              value={formatCurrency(resumen.risk)}
              icon={<AlertTriangle size={20} />}
              color='yellow'
            />
          </div>

          {presupuesto && (
            <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
              <div className='flex justify-between items-center mb-3'>
                <h2 className='text-sm font-medium text-slate-400'>
                  Progreso del mes
                </h2>
                <span className='text-sm font-semibold text-white'>
                  {porcentajeGastado.toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-slate-800 rounded-full h-3'>
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    porcentajeGastado >= 90
                      ? 'bg-red-500'
                      : porcentajeGastado >= 70
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${porcentajeGastado}%` }}
                />
              </div>
              <div className='flex justify-between mt-2'>
                <span className='text-xs text-slate-500'>
                  {formatCurrency(resumen.total)} gastado
                </span>
                <span className='text-xs text-slate-500'>
                  {formatCurrency(presupuesto.income)} total
                </span>
              </div>

              <div className='grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800'>
                <div className='text-center'>
                  <p className='text-xs text-slate-500 mb-1'>Necesario</p>
                  <p className='text-emerald-400 font-semibold text-sm'>
                    {formatCurrency(resumen.necessary)}
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-xs text-slate-500 mb-1'>Innecesario</p>
                  <p className='text-yellow-400 font-semibold text-sm'>
                    {formatCurrency(resumen.unnecessary)}
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-xs text-slate-500 mb-1'>Riesgo</p>
                  <p className='text-red-400 font-semibold text-sm'>
                    {formatCurrency(resumen.risk)}
                  </p>
                </div>
              </div>
            </div>
          )}
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
