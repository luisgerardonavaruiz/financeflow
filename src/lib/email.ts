import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendWelcomeEmail(
  to: string,
  name: string,
  appUrl: string,
) {
  await transporter.sendMail({
    from: `"FinanceFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: '¡Bienvenido a FinanceFlow! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

            <div style="text-align:center;margin-bottom:32px;">
              <div style="background:#10b981;width:64px;height:64px;border-radius:16px;
                display:inline-flex;align-items:center;justify-content:center;
                font-size:32px;font-weight:bold;color:white;">
                F
              </div>
              <h1 style="color:white;font-size:24px;margin:16px 0 4px;">
                FinanceFlow
              </h1>
              <p style="color:#64748b;margin:0;font-size:14px;">
                Tu app de finanzas personales
              </p>
            </div>

            <div style="background:#1e293b;border-radius:16px;padding:32px;
              border:1px solid #334155;">
              <h2 style="color:white;font-size:20px;margin:0 0 8px;">
                ¡Hola, ${name}! 👋
              </h2>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Tu cuenta en FinanceFlow ha sido creada exitosamente.
                Ya puedes empezar a registrar tus gastos y tomar control
                de tus finanzas personales.
              </p>

              <div style="background:#0f172a;border-radius:12px;padding:20px;
                margin-bottom:24px;border:1px solid #1e293b;">
                <p style="color:#64748b;font-size:13px;margin:0 0 12px;font-weight:bold;
                  text-transform:uppercase;letter-spacing:0.05em;">
                  Lo que puedes hacer
                </p>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${[
                    '📊 Registrar y categorizar tus gastos',
                    '💰 Controlar tu presupuesto mensual',
                    '🤖 Obtener análisis con inteligencia artificial',
                    '📱 Instalar la app en tu celular',
                  ]
                    .map(
                      (item) => `
                    <p style="color:#e2e8f0;font-size:14px;margin:0;">
                      ${item}
                    </p>
                  `,
                    )
                    .join('')}
                </div>
              </div>

              <div style="text-align:center;margin-bottom:24px;">
                <a href="${appUrl}/dashboard"
                  style="background:#10b981;color:white;padding:14px 32px;
                  border-radius:10px;text-decoration:none;font-weight:bold;
                  font-size:15px;display:inline-block;">
                  Entrar a FinanceFlow →
                </a>
              </div>

              <div style="background:#1a2744;border-radius:10px;padding:16px;
                border:1px solid #1e3a5f;">
                <p style="color:#60a5fa;font-size:13px;margin:0 0 6px;font-weight:bold;">
                  📱 Instala la app en tu celular
                </p>
                <p style="color:#93c5fd;font-size:13px;margin:0;line-height:1.5;">
                  Abre el link en Chrome (Android) o Safari (iPhone),
                  entra a la app y activa las notificaciones para recibir
                  recordatorios financieros.
                </p>
              </div>
            </div>

            <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
              Este correo fue enviado desde FinanceFlow.<br>
              Si no creaste esta cuenta, ignora este mensaje.
            </p>
          </div>
        </body>
      </html>
    `,
  })
}
