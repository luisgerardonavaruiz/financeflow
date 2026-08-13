import { auth } from '@/auth'
import { sendCustomEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAIL = 'gerardoluis206@gmail.com'

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { userId, subject, message } = await req.json()

  if (!userId || !subject || !message) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos' },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 },
    )
  }

  await sendCustomEmail(user.email, user.name, subject, message)

  return NextResponse.json({ message: 'Email enviado correctamente' })
}
