import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

  const [presupuesto, gastos] = await Promise.all([
    prisma.monthlyBudget.findUnique({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  const totalGastado = gastos.reduce((sum, g) => sum + g.amount, 0)
  const totalRiesgo = gastos
    .filter((g) => g.type === 'RISK')
    .reduce((sum, g) => sum + g.amount, 0)

  return NextResponse.json({
    presupuesto,
    ultimosGastos: gastos,
    resumen: {
      totalGastado,
      totalRiesgo,
      disponible: (presupuesto?.income ?? 0) - totalGastado,
      porcentajeGastado: presupuesto?.income
        ? Math.min((totalGastado / presupuesto.income) * 100, 100)
        : 0,
    },
  })
}
