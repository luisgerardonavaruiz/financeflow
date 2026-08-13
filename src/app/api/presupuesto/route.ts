import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const presupuestoSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  income: z.number().positive('El ingreso debe ser mayor a 0'),
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

  const presupuesto = await prisma.monthlyBudget.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: targetMonth,
        year: targetYear,
      },
    },
  })

  return NextResponse.json(presupuesto)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = presupuestoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      )
    }

    const presupuesto = await prisma.monthlyBudget.upsert({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month: parsed.data.month,
          year: parsed.data.year,
        },
      },
      update: { income: parsed.data.income },
      create: {
        userId: session.user.id,
        month: parsed.data.month,
        year: parsed.data.year,
        income: parsed.data.income,
      },
    })

    return NextResponse.json(presupuesto, { status: 201 })
  } catch (error) {
    console.error('Error al guardar presupuesto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
