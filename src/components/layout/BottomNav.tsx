'use client'

import {
  FileText,
  LayoutDashboard,
  Lightbulb,
  Receipt,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/gastos', label: 'Gastos', icon: Receipt },
  { href: '/dashboard/presupuesto', label: 'Presupuesto', icon: Wallet },
  { href: '/dashboard/reportes', label: 'Reportes', icon: FileText },
  { href: '/dashboard/consejos', label: 'Consejos', icon: Lightbulb },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className='lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50'>
      <div className='flex items-center justify-around px-2 py-2'>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg
                transition-all duration-200 min-w-0 flex-1
                ${isActive ? 'text-emerald-400' : 'text-slate-500'}
              `}
            >
              <Icon size={20} />
              <span className='text-xs font-medium truncate'>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
