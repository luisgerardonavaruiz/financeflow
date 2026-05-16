import { auth } from '@/auth'
import { GastoParaAnalisis, generarConsejos } from '@/lib/ai'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
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
    }),
  ])

  if (!presupuesto || gastos.length === 0) {
    return NextResponse.json(
      { error: 'No hay suficientes datos para generar consejos' },
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

  const consejos = await generarConsejos(gastosParaAnalisis, presupuesto.income)

  return NextResponse.json({ consejos })
}
