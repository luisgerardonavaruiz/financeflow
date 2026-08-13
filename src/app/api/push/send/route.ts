import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

const ADMIN_EMAIL = 'gerardoluis206@gmail.com'

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { userId, title, body } = await req.json()

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: 'El usuario no tiene notificaciones activadas' },
      { status: 400 },
    )
  }

  const payload = JSON.stringify({ title, body })

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      ),
    ),
  )

  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({
    message: `Notificación enviada. ${failed > 0 ? `${failed} fallaron.` : ''}`,
  })
}
