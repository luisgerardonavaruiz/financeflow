import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExpenseCategory, ExpenseType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.enum(ExpenseCategory).optional(),
  type: z.enum(ExpenseType).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const gasto = await prisma.expense.findUnique({ where: { id } })

  if (!gasto || gasto.userId !== session.user.id) {
    return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
  }

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ message: 'Gasto eliminado' })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const gasto = await prisma.expense.findUnique({ where: { id } })
  if (!gasto || gasto.userId !== session.user.id) {
    return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(parsed.data.date && { date: new Date(parsed.data.date) }),
    },
  })

  return NextResponse.json(updated)
}
