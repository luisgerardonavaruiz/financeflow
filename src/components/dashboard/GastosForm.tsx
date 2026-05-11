'use client'

import Button from '@/components/ui/Button'
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExpenseCategory, ExpenseType } from '@prisma/client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const gastoSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.string().min(1, 'El monto es requerido'),
  category: z.enum(ExpenseCategory),
  type: z.enum(ExpenseType),
  date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
})

type GastoForm = z.infer<typeof gastoSchema>

interface GastoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function GastoForm({ onSuccess, onCancel }: GastoFormProps) {
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GastoForm>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: ExpenseCategory.OTHER,
      type: ExpenseType.NECESSARY,
    },
  })

  const onSubmit = async (data: GastoForm) => {
    setServerError('')
    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setServerError(json.error)
        return
      }

      onSuccess()
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.')
    }
  }

  const inputClass = (error?: string) => `
    w-full px-4 py-3 rounded-lg bg-slate-800 border text-white
    placeholder-slate-500 outline-none transition-all duration-200
    focus:ring-2 focus:ring-emerald-500 focus:border-transparent
    ${error ? 'border-red-500' : 'border-slate-700'}
  `

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='col-span-2'>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Descripción
          </label>
          <input
            {...register('description')}
            placeholder='Ej: Despensa semanal'
            className={inputClass(errors.description?.message)}
          />
          {errors.description && (
            <p className='text-red-400 text-xs mt-1'>
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Monto (MXN)
          </label>
          <input
            {...register('amount')}
            type='number'
            step='0.01'
            placeholder='0.00'
            className={inputClass(errors.amount?.message)}
          />
          {errors.amount && (
            <p className='text-red-400 text-xs mt-1'>{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Fecha
          </label>
          <input
            {...register('date')}
            type='date'
            className={inputClass(errors.date?.message)}
          />
          {errors.date && (
            <p className='text-red-400 text-xs mt-1'>{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Categoría
          </label>
          <select {...register('category')} className={inputClass()}>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Tipo
          </label>
          <select {...register('type')} className={inputClass()}>
            {Object.entries(EXPENSE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className='col-span-2'>
          <label className='text-sm font-medium text-slate-300 block mb-1'>
            Notas (opcional)
          </label>
          <textarea
            {...register('notes')}
            placeholder='Alguna nota adicional...'
            rows={2}
            className={inputClass() + ' resize-none'}
          />
        </div>
      </div>

      {serverError && (
        <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3'>
          <p className='text-red-400 text-sm'>{serverError}</p>
        </div>
      )}

      <div className='flex gap-3'>
        <Button type='button' variant='secondary' onClick={onCancel}>
          Cancelar
        </Button>
        <Button type='submit' isLoading={isSubmitting}>
          Guardar gasto
        </Button>
      </div>
    </form>
  )
}
