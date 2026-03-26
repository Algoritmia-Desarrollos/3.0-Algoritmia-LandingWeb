import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, telefono, servicios, mensaje } = data;

    // Validación básica
    if (!nombre || !email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Faltan campos requeridos" 
      }), { status: 400 });
    }

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.EMAIL_USER,
        pass: import.meta.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    // Formatear servicios
    const serviciosObtenidos = Array.isArray(servicios) && servicios.length > 0
      ? servicios.join(', ')
      : 'Ninguno especificado';

    // Dominio del remitente (para Message-ID)
    const senderDomain = (import.meta.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar').split('@')[1];
    const messageId = `<${crypto.randomUUID()}@${senderDomain}>`;

    // Versión de texto plano (reduce probabilidad de spam)
    const textPlain = `
Nuevo Mensaje de Contacto - Algoritmia Desarrollos
===================================================
Nombre:              ${nombre}
Email:               ${email}
Telefono:            ${telefono || 'No especificado'}
Servicios de interes: ${serviciosObtenidos}

Mensaje:
${mensaje || 'Sin mensaje adicional'}

---
Este email fue generado automaticamente desde el formulario de contacto de algoritmiadesarrollos.com.ar
    `.trim();

    // Opciones del correo con headers anti-spam
    const mailOptions = {
      from: `"Algoritmia Desarrollos" <${import.meta.env.EMAIL_USER}>`,
      to: 'algoritmiadesarrollos@gmail.com',
      cc: 'info@algoritmiadesarrollos.com.ar',
      replyTo: `"${nombre}" <${email}>`,
      subject: `[Contacto Web] ${nombre} - ${serviciosObtenidos}`,
      messageId,
      headers: {
        'X-Mailer': 'Algoritmia-Web-Contact/1.0',
        'X-Priority': '3',
        'Precedence': 'bulk',
      },
      text: textPlain,
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Contacto Web</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background:#6d28d9;padding:24px 30px;">
              <h1 style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:20px;font-weight:700;">
                Algoritmia Desarrollos
              </h1>
              <p style="margin:4px 0 0;color:#e9d5ff;font-family:Arial,sans-serif;font-size:14px;">
                Nuevo mensaje desde el formulario de contacto
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;font-family:Arial,sans-serif;font-size:14px;color:#374151;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700;width:40%;">Nombre</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700;">Email</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">${email}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700;">Telefono</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">${telefono || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:700;">Servicios</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">${serviciosObtenidos}</td>
                </tr>
              </table>

              <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:6px;border-left:4px solid #6d28d9;">
                <p style="margin:0 0 8px;font-weight:700;">Mensaje:</p>
                <p style="margin:0;white-space:pre-wrap;">${mensaje || 'Sin mensaje adicional'}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;
                       font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">
              Este correo fue generado automaticamente desde el formulario de contacto de
              <a href="https://algoritmiadesarrollos.com.ar" style="color:#6d28d9;text-decoration:none;">
                algoritmiadesarrollos.com.ar
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
    }), { status: 200 });

  } catch (error) {
    console.error('--- START EMAIL ERROR ---');
    console.error(error);
    console.error('--- END EMAIL ERROR ---');
    return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500 });
  }
}
