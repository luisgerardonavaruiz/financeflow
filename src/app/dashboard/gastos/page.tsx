'use client'

import GastoForm from '@/components/dashboard/GastosForm'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TYPES,
  EXPENSE_TYPE_COLORS,
} from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Expense } from '@prisma/client'
import { Plus, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function GastosPage() {
  const [gastos, setGastos] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const fetchGastos = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/gastos?month=${month}&year=${year}`)
    const data = await res.json()
    setGastos(data)
    setLoading(false)
  }, [month, year])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await fetch(`/api/gastos/${id}`, { method: 'DELETE' })
    setGastos((prev) => prev.filter((g) => g.id !== id))
    setDeletingId(null)
  }

  const total = gastos.reduce((sum, g) => sum + g.amount, 0)

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

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Gastos</h1>
          <p className='text-slate-400 text-sm mt-1'>
            Total: {formatCurrency(total)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className='flex items-center gap-2 px-4 py-2 bg-emerald-500
      hover:bg-emerald-600 text-white rounded-lg text-sm font-medium
      transition-colors whitespace-nowrap shrink-0'
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className='flex gap-3 py-1'>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className='px-3 py-2 rounded-lg bg-slate-900 border border-slate-800
      text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500
      shrink-0'
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
      text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500
      shrink-0'
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-white'>Nuevo gasto</h2>
            <button
              onClick={() => setShowForm(false)}
              className='text-slate-400 hover:text-white transition-colors'
            >
              <X size={20} />
            </button>
          </div>
          <GastoForm
            onSuccess={() => {
              setShowForm(false)
              fetchGastos()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className='bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : gastos.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3'>
            <p className='text-slate-500 text-sm'>
              No hay gastos en este período
            </p>
            <button
              onClick={() => setShowForm(true)}
              className='text-emerald-400 text-sm hover:text-emerald-300 font-medium'
            >
              Registrar primer gasto →
            </button>
          </div>
        ) : (
          <div className='divide-y divide-slate-800'>
            {gastos.map((gasto) => (
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
                      {EXPENSE_TYPES[gasto.type as keyof typeof EXPENSE_TYPES]}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <p className='text-white font-semibold whitespace-nowrap'>
                    {formatCurrency(gasto.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(gasto.id)}
                    disabled={deletingId === gasto.id}
                    className='text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
