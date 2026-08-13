'use client'

import { Bell, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  pushSubscriptions: { id: string }[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    fetch('/api/push/users')
      .then((res) => {
        if (res.status === 401) {
          setUnauthorized(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) setUsers(data)
        setLoading(false)
      })
  }, [])

  const handleSend = async () => {
    if (!selectedUser || !title || !body) return
    setSending(true)
    setResult('')

    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUser, title, body }),
    })

    const data = await res.json()
    setResult(data.message ?? data.error)
    setSending(false)
  }

  if (unauthorized) {
    return (
      <div className='flex flex-col items-center justify-center py-24 gap-4'>
        <p className='text-red-400 text-lg font-semibold'>Acceso denegado</p>
        <p className='text-slate-500 text-sm'>
          Solo el administrador puede acceder a esta página.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Panel de admin</h1>
        <p className='text-slate-400 text-sm mt-1'>
          Envía notificaciones push a los usuarios
        </p>
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <div className='flex items-center gap-2 mb-4'>
          <Users size={18} className='text-emerald-400' />
          <h2 className='text-base font-semibold text-white'>
            Usuarios registrados
          </h2>
        </div>

        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer
                  transition-all border ${
                    selectedUser === user.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-800/50'
                  }`}
              >
                <div>
                  <p className='text-white font-medium text-sm'>{user.name}</p>
                  <p className='text-slate-500 text-xs'>{user.email}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {user.pushSubscriptions.length > 0 ? (
                    <span className='text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
                      Notificaciones activas
                    </span>
                  ) : (
                    <span className='text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-500'>
                      Sin notificaciones
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <div className='flex items-center gap-2 mb-4'>
          <Bell size={18} className='text-emerald-400' />
          <h2 className='text-base font-semibold text-white'>
            Enviar notificación
          </h2>
        </div>

        <div className='flex flex-col gap-4'>
          <div>
            <label className='text-sm font-medium text-slate-300 block mb-1'>
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ej: Recordatorio de gastos'
              className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                text-white placeholder-slate-500 outline-none focus:ring-2
                focus:ring-emerald-500 focus:border-transparent'
            />
          </div>

          <div>
            <label className='text-sm font-medium text-slate-300 block mb-1'>
              Mensaje
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='Ej: No olvides registrar tus gastos de hoy'
              rows={3}
              className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                text-white placeholder-slate-500 outline-none focus:ring-2
                focus:ring-emerald-500 resize-none'
            />
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg text-sm ${
                result.includes('error') || result.includes('fallaron')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              {result}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !selectedUser || !title || !body}
            className='flex items-center justify-center gap-2 px-6 py-3
              bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg
              text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {sending ? (
              <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            ) : (
              <Send size={16} />
            )}
            {sending ? 'Enviando...' : 'Enviar notificación'}
          </button>
        </div>
      </div>
    </div>
  )
}
