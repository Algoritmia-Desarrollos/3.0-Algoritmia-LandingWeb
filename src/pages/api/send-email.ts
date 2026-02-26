import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, telefono, servicios, mensaje } = data;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar', 
        pass: process.env.EMAIL_PASS || 'Qpzm123Qpzm-' 
      },
    });

    // Formatear servicios
    const serviciosObtenidos = Array.isArray(servicios) && servicios.length > 0 
      ? servicios.join(', ') 
      : 'Ninguno especificado';

    // Email Layout
    const mailOptions = {
      from: `"Contacto Algoritmia Web" <${process.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar'}>`,
      to: 'info@algoritmiadesarrollos.com.ar', 
      replyTo: email,
      subject: `🔥 NUEVO CONTACTO WEB: ${nombre}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #6d28d9; margin-bottom: 20px;">Nuevo Mensaje de Contacto</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f9fafb;">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${nombre || 'No especificado'}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${email || 'No especificado'}</td>
            </tr>
            <tr style="background: #f9fafb;">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Teléfono:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${telefono || 'No especificado'}</td>
            </tr>
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Servicios de interés:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${serviciosObtenidos}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Mensaje:</strong></p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${mensaje || 'Sin mensaje adicional'}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
    }), { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500 });
  }
}
