'use client'

import { Lightbulb, RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function ConsejosPage() {
  const [consejos, setConsejos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  const fetchConsejos = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/consejos')
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setConsejos(data.consejos)
    setLoaded(true)
    setLoading(false)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Consejos IA</h1>
        <p className='text-slate-400 text-sm mt-1'>
          Consejos financieros personalizados basados en tus gastos del mes
        </p>
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20'>
            <TrendingUp size={20} className='text-emerald-400' />
          </div>
          <div>
            <p className='text-white font-medium'>Análisis del mes actual</p>
            <p className='text-slate-500 text-xs'>
              Claude analiza tus patrones de gasto y genera consejos
              personalizados
            </p>
          </div>
        </div>

        <button
          onClick={fetchConsejos}
          disabled={loading}
          className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5
            bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm
            font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Generando consejos...
            </>
          ) : (
            <>
              {loaded ? <RefreshCw size={16} /> : <Lightbulb size={16} />}
              {loaded ? 'Regenerar consejos' : 'Obtener consejos'}
            </>
          )}
        </button>

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

      {consejos.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h2 className='text-base font-semibold text-white'>
            Tus consejos personalizados
          </h2>
          {consejos.map((consejo, i) => (
            <div
              key={i}
              className='bg-slate-900 rounded-2xl p-5 border border-slate-800
                flex gap-4 items-start'
            >
              <div
                className='w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                flex items-center justify-center shrink-0'
              >
                <span className='text-emerald-400 text-sm font-bold'>
                  {i + 1}
                </span>
              </div>
              <div className='flex-1'>
                <p className='text-slate-300 text-sm leading-relaxed'>
                  {consejo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loaded && !loading && (
        <div
          className='bg-slate-900 rounded-2xl p-8 border border-slate-800 border-dashed
          flex flex-col items-center gap-3'
        >
          <Lightbulb size={32} className='text-slate-600' />
          <p className='text-slate-500 text-sm text-center'>
            Haz clic en "Obtener consejos" para que Claude analice tus finanzas
            y te dé recomendaciones personalizadas.
          </p>
          <p className='text-slate-600 text-xs text-center'>
            Necesitas tener gastos y presupuesto registrados este mes.
          </p>
        </div>
      )}
    </div>
  )
}
