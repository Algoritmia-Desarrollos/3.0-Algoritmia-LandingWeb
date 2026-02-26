
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
      host: import.meta.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.EMAIL_USER, 
        pass: import.meta.env.EMAIL_PASS
      },
    });

    // Mapeo amigable de valores
    const labels = {
      revenue: {
        'less_3k': 'Menos de $3.000 USD',
        '3k_5k': '$3.000 - $5.000 USD',
        '5k_10k': '$5.000 - $10.000 USD',
        '10k_30k': '$10.000 - $30.000 USD',
        'plus_30k': 'Más de $30.000 USD'
      },
      adSpend: {
        'none': 'No invierto aún',
        'less_300': 'Menos de $300 USD',
        '300_500': '$300 - $500 USD',
        '500_1k': '$500 - $1.000 USD',
        '1k_3k': '$1.000 - $3.000 USD',
        'plus_3k': 'Más de $3.000 USD'
      },
      obstacle: {
        'scaling': 'No logro escalar (CPA sube)',
        'creative': 'Me faltan creativos / anuncios',
        'tracking': 'No sé qué estoy midiendo',
        'time': 'No tengo tiempo para gestionar',
        'other': 'Otro'
      }
    };

    const getLabel = (category: string, value: string) => {
      // @ts-ignore
      return (value && labels[category] && labels[category][value]) ? labels[category][value] : (value || 'No especificado');
    };

    // Email Layout
    const mailOptions = {
      from: `"Lead Algoritmia Ads" <${import.meta.env.EMAIL_USER}>`,
      to: 'algoritmiadesarrollos@gmail.com, info@algoritmiadesarrollos.com.ar', 
      replyTo: email,
      subject: `🔥 NUEVO LEAD ADS: ${nombre} (${businessType})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px;">
          <h2 style="color: #6d28d9; margin-bottom: 20px;">Nuevo Lead Calificado</h2>
          
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
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Negocio:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${businessType || 'No especificado'}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">Datos de Calificación</h3>
            ${revenue ? `<p style="margin: 5px 0;"><strong>Facturación:</strong> <span style="font-size: 1.1em; font-weight: bold;">${getLabel('revenue', revenue)}</span></p>` : ''}
            <p style="margin: 5px 0;"><strong>Inversión Ads:</strong> <span style="font-size: 1.1em; font-weight: bold;">${getLabel('adSpend', adSpend)}</span></p>
            ${obstacle ? `<p style="margin: 5px 0;"><strong>Problema:</strong> ${getLabel('obstacle', obstacle)}</p>` : ''}
          </div>

          <div style="margin-top: 20px;">
            <p><strong>Comentarios:</strong></p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${comments || 'Sin comentarios adicionales'}</p>
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

