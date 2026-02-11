
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nombre, email, telefono, revenue, adSpend, obstacle, businessType, comments } = data;

    // Server-side Double Check Qualification
    // (Although we check in frontend, we might want to log everything or filter here too)
    const isQualified = 
        revenue !== 'less_3k' && 
        adSpend !== 'none' && 
        adSpend !== 'less_300';

    if (!isQualified) {
        // We can choose to save this lead as "Rejected" in a DB if we had one.
        // For now, we just acknowledge receipt but don't notify the admin email to avoid spam,
        // OR we notify with a [LOW PRIORITY] tag.
        // Let's decide to NOT email for disqualified leads to keep inbox clean as requested ("Ahorrás tiempo").
        return new Response(JSON.stringify({ qualified: false }), { status: 200 });
    }

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

    // Email Layout
    const mailOptions = {
      from: `"Lead Algoritmia Ads" <${process.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar'}>`,
      to: 'info@algoritmiadesarrollos.com.ar', 
      replyTo: email,
      subject: `🔥 NUEVO LEAD ADS: ${nombre} (${businessType})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #6d28d9; margin-bottom: 20px;">Nuevo Lead Calificado</h2>
          
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
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>WhatsApp:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${telefono}</td>
            </tr>
             <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Negocio:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${businessType}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">Datos de Calificación</h3>
            <p style="margin: 5px 0;"><strong>Facturación:</strong> <span style="font-size: 1.1em; font-weight: bold;">${revenue}</span></p>
            <p style="margin: 5px 0;"><strong>Inversión Ads:</strong> <span style="font-size: 1.1em; font-weight: bold;">${adSpend}</span></p>
            <p style="margin: 5px 0;"><strong>Problema:</strong> ${obstacle}</p>
          </div>

          <div style="margin-top: 20px;">
            <p><strong>Comentarios:</strong></p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${comments || 'Sin comentarios'}</p>
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

