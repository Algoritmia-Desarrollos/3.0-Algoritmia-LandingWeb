import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

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

    // Configuración de Nodemailer usando import.meta.env
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.EMAIL_USER, 
        pass: import.meta.env.EMAIL_PASS 
      },
    });

    // Formatear servicios
    const serviciosObtenidos = Array.isArray(servicios) && servicios.length > 0 
      ? servicios.join(', ') 
      : 'Ninguno especificado';

    // Opciones del correo
    const mailOptions = {
      from: `"Contacto Algoritmia Web" <${import.meta.env.EMAIL_USER}>`,
      to: 'algoritmiadesarrollos@gmail.com, info@algoritmiadesarrollos.com.ar', 
      replyTo: email,
      subject: `🔥 NUEVO CONTACTO WEB: ${nombre}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #6d28d9; margin-bottom: 20px;">Nuevo Mensaje de Contacto</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f9fafb;">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${nombre}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${email}</td>
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
    console.error('--- START EMAIL ERROR ---');
    console.error(error);
    console.error('--- END EMAIL ERROR ---');
    return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500 });
  }
}
