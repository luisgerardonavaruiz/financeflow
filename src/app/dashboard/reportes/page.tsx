'use client'

import { formatCurrency } from '@/lib/utils'
import {
  AlertTriangle,
  FileText,
  Heart,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

interface Analisis {
  resumenGeneral: string
  gastosNecesarios: string
  gastosInnecesarios: string
  gastosRiesgo: string
  consejosPersonalizados: string[]
  puntuacionSalud: number
}

interface ReporteData {
  mes: string
  presupuesto: { income: number }
  gastos: { amount: number; type: string }[]
  analisis: Analisis
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

export default function ReportesPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generarReporte = async () => {
    setLoading(true)
    setError('')
    setReporte(null)

    const res = await fetch(`/api/reportes?month=${month}&year=${year}`)
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setReporte(data)
    setLoading(false)
  }

  const totalGastado = reporte?.gastos.reduce((s, g) => s + g.amount, 0) ?? 0
  const totalNecesario =
    reporte?.gastos
      .filter((g) => g.type === 'NECESSARY')
      .reduce((s, g) => s + g.amount, 0) ?? 0
  const totalInnecesario =
    reporte?.gastos
      .filter((g) => g.type === 'UNNECESSARY')
      .reduce((s, g) => s + g.amount, 0) ?? 0
  const totalRiesgo =
    reporte?.gastos
      .filter((g) => g.type === 'RISK')
      .reduce((s, g) => s + g.amount, 0) ?? 0

  const healthColor =
    (reporte?.analisis.puntuacionSalud ?? 0) >= 70
      ? 'text-emerald-400'
      : (reporte?.analisis.puntuacionSalud ?? 0) >= 40
        ? 'text-yellow-400'
        : 'text-red-400'

  const healthBg =
    (reporte?.analisis.puntuacionSalud ?? 0) >= 70
      ? 'bg-emerald-500'
      : (reporte?.analisis.puntuacionSalud ?? 0) >= 40
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Reportes</h1>
        <p className='text-slate-400 text-sm mt-1'>
          Análisis inteligente de tus finanzas con IA
        </p>
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <h2 className='text-base font-semibold text-white mb-4'>
          Generar reporte
        </h2>
        <div className='flex flex-col sm:flex-row gap-3'>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className='flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700
              text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500'
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
            className='flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700
              text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500'
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={generarReporte}
            disabled={loading}
            className='w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600
              text-white rounded-lg text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex
              items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Analizando...
              </>
            ) : (
              <>
                <FileText size={16} />
                Generar reporte
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className='mt-4 p-4 bg-slate-800 rounded-lg'>
            <p className='text-slate-400 text-sm text-center'>
              Claude está analizando tus finanzas... esto puede tardar unos
              segundos.
            </p>
          </div>
        )}

        {error && (
          <div className='mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}
      </div>

      {reporte && (
        <>
          <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-white'>
                Reporte — {reporte.mes}
              </h2>
              <div className='flex items-center gap-2'>
                <Heart size={16} className={healthColor} />
                <span className={`text-lg font-bold ${healthColor}`}>
                  {reporte.analisis.puntuacionSalud}/100
                </span>
              </div>
            </div>

            <div className='w-full bg-slate-800 rounded-full h-2 mb-6'>
              <div
                className={`h-2 rounded-full transition-all duration-700 ${healthBg}`}
                style={{ width: `${reporte.analisis.puntuacionSalud}%` }}
              />
            </div>

            <p className='text-slate-300 text-sm leading-relaxed'>
              {reporte.analisis.resumenGeneral}
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <AnalisisCard
              title='Gastos necesarios'
              amount={totalNecesario}
              description={reporte.analisis.gastosNecesarios}
              icon={<TrendingUp size={18} />}
              color='green'
            />
            <AnalisisCard
              title='Gastos innecesarios'
              amount={totalInnecesario}
              description={reporte.analisis.gastosInnecesarios}
              icon={<TrendingDown size={18} />}
              color='yellow'
            />
            <AnalisisCard
              title='Gastos de riesgo'
              amount={totalRiesgo}
              description={reporte.analisis.gastosRiesgo}
              icon={<AlertTriangle size={18} />}
              color='red'
            />
          </div>

          <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
            <div className='flex items-center gap-2 mb-4'>
              <Lightbulb size={18} className='text-emerald-400' />
              <h2 className='text-base font-semibold text-white'>
                Consejos personalizados
              </h2>
            </div>
            <div className='flex flex-col gap-3'>
              {reporte.analisis.consejosPersonalizados.map((consejo, i) => (
                <div key={i} className='flex gap-3 p-4 bg-slate-800 rounded-xl'>
                  <span className='text-emerald-400 font-bold text-sm shrink-0'>
                    {i + 1}.
                  </span>
                  <p className='text-slate-300 text-sm leading-relaxed'>
                    {consejo}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
            <h2 className='text-base font-semibold text-white mb-4'>
              Resumen numérico
            </h2>
            <div className='flex flex-col gap-3'>
              <ResumenRow
                label='Ingreso del mes'
                value={formatCurrency(reporte.presupuesto.income)}
                color='text-white'
              />
              <ResumenRow
                label='Total gastado'
                value={formatCurrency(totalGastado)}
                color='text-red-400'
              />
              <ResumenRow
                label='Gastos necesarios'
                value={formatCurrency(totalNecesario)}
                color='text-emerald-400'
              />
              <ResumenRow
                label='Gastos innecesarios'
                value={formatCurrency(totalInnecesario)}
                color='text-yellow-400'
              />
              <ResumenRow
                label='Gastos de riesgo'
                value={formatCurrency(totalRiesgo)}
                color='text-red-400'
              />
              <div className='border-t border-slate-800 pt-3 mt-1'>
                <ResumenRow
                  label='Dinero disponible'
                  value={formatCurrency(
                    reporte.presupuesto.income - totalGastado,
                  )}
                  color={
                    reporte.presupuesto.income - totalGastado >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface AnalisisCardProps {
  title: string
  amount: number
  description: string
  icon: React.ReactNode
  color: 'green' | 'yellow' | 'red'
}

const cardColorMap = {
  green: {
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400',
    amount: 'text-emerald-400',
  },
  yellow: {
    border: 'border-yellow-500/20',
    icon: 'bg-yellow-500/10 text-yellow-400',
    amount: 'text-yellow-400',
  },
  red: {
    border: 'border-red-500/20',
    icon: 'bg-red-500/10 text-red-400',
    amount: 'text-red-400',
  },
}

function AnalisisCard({
  title,
  amount,
  description,
  icon,
  color,
}: AnalisisCardProps) {
  const colors = cardColorMap[color]
  return (
    <div className={`bg-slate-900 rounded-2xl p-5 border ${colors.border}`}>
      <div className='flex items-center gap-3 mb-3'>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}
        >
          {icon}
        </div>
        <div>
          <p className='text-white text-sm font-medium'>{title}</p>
          <p className={`text-lg font-bold ${colors.amount}`}>
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
      <p className='text-slate-400 text-sm leading-relaxed'>{description}</p>
    </div>
  )
}

function ResumenRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-slate-400 text-sm'>{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
