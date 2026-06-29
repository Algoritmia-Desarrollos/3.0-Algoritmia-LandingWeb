import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, telefono, currentWeb, businessDescription, comments } = data;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.EMAIL_USER, 
        pass: import.meta.env.EMAIL_PASS
      },
    });

    // Email Layout
    const mailOptions = {
      from: `"Lead Landing Page" <${import.meta.env.EMAIL_USER}>`,
      to: 'algoritmiadesarrollos@gmail.com, info@algoritmiadesarrollos.com.ar', 
      replyTo: email,
      subject: `⚡ NUEVO LEAD LANDING: ${nombre}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #0f766e; margin-bottom: 20px;">Nueva Solicitud de Landing Page</h2>
          
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
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>WhatsApp:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${telefono || 'No especificado'}</td>
            </tr>
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Web Actual / Instagram:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${currentWeb || 'No especificado'}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #0f766e; font-size: 16px;">Detalle del Negocio / Producto</h3>
            <p style="margin: 5px 0; font-size: 1.05em; line-height: 1.5; color: #1e293b;">${businessDescription || 'No especificado'}</p>
          </div>

          ${comments ? `
          <div style="margin-top: 20px;">
            <p><strong>Comentarios Adicionales:</strong></p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; color: #374151;">${comments}</p>
          </div>` : ''}
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Landing lead email sent successfully' 
    }), { status: 200 });

  } catch (error) {
    console.error('--- START LANDING EMAIL ERROR ---');
    console.error(error);
    console.error('--- END LANDING EMAIL ERROR ---');
    return new Response(JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500 });
  }
}
