import { auth } from '@/auth'
import { analizarGastos, GastoParaAnalisis } from '@/lib/ai'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const monthNames = [
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

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const month = url.searchParams.get('month')
  const year = url.searchParams.get('year')

  const now = new Date()
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1
  const targetYear = year ? parseInt(year) : now.getFullYear()

  const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0))
  const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59))

  const [presupuesto, gastos] = await Promise.all([
    prisma.monthlyBudget.findUnique({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month: targetMonth,
          year: targetYear,
        },
      },
    }),
    prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    }),
  ])

  if (!presupuesto || gastos.length === 0) {
    return NextResponse.json(
      { error: 'No hay suficientes datos para generar un reporte' },
      { status: 400 },
    )
  }

  const gastosParaAnalisis: GastoParaAnalisis[] = gastos.map((g) => ({
    description: g.description,
    amount: g.amount,
    category: EXPENSE_CATEGORIES[g.category as keyof typeof EXPENSE_CATEGORIES],
    type: g.type,
    date: g.date.toISOString(),
  }))

  const analisis = await analizarGastos(
    gastosParaAnalisis,
    presupuesto.income,
    `${monthNames[targetMonth - 1]} ${targetYear}`,
  )

  return NextResponse.json({
    mes: `${monthNames[targetMonth - 1]} ${targetYear}`,
    presupuesto,
    gastos,
    analisis,
  })
}
