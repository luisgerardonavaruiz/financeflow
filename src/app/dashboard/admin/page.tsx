'use client'

import { Bell, Mail, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  pushSubscriptions: { id: string }[]
}

type Tab = 'notificaciones' | 'email'

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('notificaciones')

  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [sendingPush, setSendingPush] = useState(false)
  const [pushResult, setPushResult] = useState('')

  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState('')

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

  const handleSendPush = async () => {
    if (!selectedUser || !pushTitle || !pushBody) return
    setSendingPush(true)
    setPushResult('')

    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser,
        title: pushTitle,
        body: pushBody,
      }),
    })

    const data = await res.json()
    setPushResult(data.message ?? data.error)
    setSendingPush(false)
  }

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject || !emailMessage) return
    setSendingEmail(true)
    setEmailResult('')

    const res = await fetch('/api/admin/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser,
        subject: emailSubject,
        message: emailMessage,
      }),
    })

    const data = await res.json()
    setEmailResult(data.message ?? data.error)
    setSendingEmail(false)
  }

  const selectedUserData = users.find((u) => u.id === selectedUser)

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
          Gestiona usuarios y envía comunicaciones
        </p>
      </div>

      <div className='bg-slate-900 rounded-2xl p-6 border border-slate-800'>
        <div className='flex items-center gap-2 mb-4'>
          <Users size={18} className='text-emerald-400' />
          <h2 className='text-base font-semibold text-white'>
            Selecciona un usuario
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
                    <span
                      className='text-xs px-2 py-1 rounded-full
                      bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    >
                      Push activo
                    </span>
                  ) : (
                    <span
                      className='text-xs px-2 py-1 rounded-full
                      bg-slate-700 text-slate-500'
                    >
                      Sin push
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className='bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'>
          <div className='flex border-b border-slate-800'>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium
                transition-colors flex-1 justify-center ${
                  activeTab === 'notificaciones'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
            >
              <Bell size={16} />
              Notificación push
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium
                transition-colors flex-1 justify-center ${
                  activeTab === 'email'
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
            >
              <Mail size={16} />
              Email
            </button>
          </div>

          <div className='p-6'>
            {activeTab === 'notificaciones' ? (
              <div className='flex flex-col gap-4'>
                <p className='text-slate-400 text-sm'>
                  Enviando a{' '}
                  <span className='text-white font-medium'>
                    {selectedUserData?.name}
                  </span>
                  {selectedUserData?.pushSubscriptions.length === 0 && (
                    <span className='text-yellow-400 ml-2'>
                      — este usuario no tiene push activo
                    </span>
                  )}
                </p>

                <div>
                  <label className='text-sm font-medium text-slate-300 block mb-1'>
                    Título
                  </label>
                  <input
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder='Ej: Recordatorio de gastos'
                    className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                      text-white placeholder-slate-500 outline-none focus:ring-2
                      focus:ring-emerald-500'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-slate-300 block mb-1'>
                    Mensaje
                  </label>
                  <textarea
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder='Ej: No olvides registrar tus gastos de hoy'
                    rows={3}
                    className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                      text-white placeholder-slate-500 outline-none focus:ring-2
                      focus:ring-emerald-500 resize-none'
                  />
                </div>

                {pushResult && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      pushResult.includes('error') ||
                      pushResult.includes('fallaron')
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {pushResult}
                  </div>
                )}

                <button
                  onClick={handleSendPush}
                  disabled={sendingPush || !pushTitle || !pushBody}
                  className='flex items-center justify-center gap-2 px-6 py-3
                    bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg
                    text-sm font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {sendingPush ? (
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <Bell size={16} />
                  )}
                  {sendingPush ? 'Enviando...' : 'Enviar notificación'}
                </button>
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                <p className='text-slate-400 text-sm'>
                  Enviando a{' '}
                  <span className='text-white font-medium'>
                    {selectedUserData?.name}
                  </span>{' '}
                  <span className='text-slate-500'>
                    ({selectedUserData?.email})
                  </span>
                </p>

                <div>
                  <label className='text-sm font-medium text-slate-300 block mb-1'>
                    Asunto
                  </label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder='Ej: Activa tus notificaciones en FinanceFlow'
                    className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                      text-white placeholder-slate-500 outline-none focus:ring-2
                      focus:ring-emerald-500'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-slate-300 block mb-1'>
                    Mensaje
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder='Escribe tu mensaje aquí...'
                    rows={5}
                    className='w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700
                      text-white placeholder-slate-500 outline-none focus:ring-2
                      focus:ring-emerald-500 resize-none'
                  />
                </div>

                {emailResult && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      emailResult.includes('error') ||
                      emailResult.includes('Error')
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {emailResult}
                  </div>
                )}

                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailSubject || !emailMessage}
                  className='flex items-center justify-center gap-2 px-6 py-3
                    bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg
                    text-sm font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {sendingEmail ? (
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <Send size={16} />
                  )}
                  {sendingEmail ? 'Enviando...' : 'Enviar email'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
