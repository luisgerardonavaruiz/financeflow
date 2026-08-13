import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExpenseCategory, ExpenseType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const gastoSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  category: z.enum(ExpenseCategory),
  type: z.enum(ExpenseType),
  date: z.string(),
  notes: z.string().optional(),
})

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

  const gastos = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(gastos)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = gastoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 })
    }

    const gasto = await prisma.expense.create({
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date + 'T00:00:00.000Z'),
        userId: session.user.id,
      },
    })

    return NextResponse.json(gasto, { status: 201 })
  } catch (error) {
    console.error('Error al crear gasto: ', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
