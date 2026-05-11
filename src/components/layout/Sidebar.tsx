'use client'

import {
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Receipt,
  User,
  Wallet,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/gastos', label: 'Gastos', icon: Receipt },
  { href: '/dashboard/presupuesto', label: 'Presupuesto', icon: Wallet },
  { href: '/dashboard/reportes', label: 'Reportes', icon: FileText },
  { href: '/dashboard/consejos', label: 'Consejos IA', icon: Lightbulb },
]

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className='hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4'>
      <div className='mb-8 px-2'>
        <h1 className='text-xl font-bold text-white'>FinanceFlow</h1>
        <p className='text-slate-500 text-xs mt-1'>Control financiero</p>
      </div>

      <nav className='flex flex-col gap-1 flex-1'>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                transition-all duration-200 font-medium
                ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className='border-t border-slate-800 pt-4 mt-4'>
        <div className='flex items-center gap-3 px-3 py-2 mb-2'>
          <div className='w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center'>
            <User size={16} className='text-emerald-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-white truncate'>
              {user.name}
            </p>
            <p className='text-xs text-slate-500 truncate'>{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-slate-400 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200 w-full font-medium'
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
