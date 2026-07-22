import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      nombre, 
      email, 
      telefono, 
      revenue, 
      adSpend, 
      obstacle, 
      businessType, 
      platform,
      hasValidatedOffer,
      comments,
      disqualificationReason 
    } = data;

    // Qualification check
    const isQualified = 
      !disqualificationReason &&
      revenue !== 'less_3k' && 
      hasValidatedOffer !== 'no_sales' &&
      hasValidatedOffer !== 'no_store';

    // Nodemailer transport
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST || 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.EMAIL_USER, 
        pass: import.meta.env.EMAIL_PASS
      },
    });

    const labels = {
      revenue: {
        '0_5k': 'Entre $0 a $5.000 USD / mes',
        '5k_20k': 'Entre $5.000 a $20.000 USD / mes',
        '20k_50k': 'Entre $20.000 a $50.000 USD / mes',
        '50k_100k': 'Entre $50.000 a $100.000 USD / mes',
        'plus_100k': 'Más de $100.000 USD / mes'
      },
      adSpend: {
        'never': 'No invierto actualmente',
        '0_500': 'Entre $0 a $500 USD / mes',
        '500_1500': 'Entre $500 a $1.500 USD / mes',
        '1500_5000': 'Entre $1.500 a $5.000 USD / mes',
        'plus_5000': 'Más de $5.000 USD / mes'
      },
      hasValidatedOffer: {
        'yes_active': 'Sí, ventas activas (online / físico / directo)',
        'no_sales': 'Sin ventas regulares aún',
        'no_store': 'Sin ventas activas ni oferta validada'
      }
    };

    const getLabel = (category: string, value: string) => {
      // @ts-ignore
      return (value && labels[category] && labels[category][value]) ? labels[category][value] : (value || 'No especificado');
    };

    const subjectPrefix = isQualified 
      ? '🔥 NUEVO LEAD CALIFICADO' 
      : '❌ LEAD DESCALIFICADO EN FORMULARIO';

    const mailOptions = {
      from: `"Lead Algoritmia Ads" <${import.meta.env.EMAIL_USER}>`,
      to: 'algoritmiadesarrollos@gmail.com, info@algoritmiadesarrollos.com.ar', 
      replyTo: email || import.meta.env.EMAIL_USER,
      subject: `${subjectPrefix}: ${nombre || 'Prospecto sin nombre'} (${businessType || 'Sin categoría'})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; background-color: #ffffff;">
          <h2 style="color: ${isQualified ? '#059669' : '#d97706'}; margin-bottom: 20px;">
            ${isQualified ? '🔥 Nuevo Lead Calificado' : '⚠️ Lead Descalificado en Formulario'}
          </h2>
          
          ${disqualificationReason ? `
            <div style="padding: 12px 16px; background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #d48806; font-size: 14px;"><strong>Motivo de Descalificación:</strong> ${disqualificationReason}</p>
            </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #f9fafb;">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nombre:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${nombre || 'No completado aún (descalificado tempranamente)'}</td>
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
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Modelo de Negocio:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${businessType || 'No especificado'}</td>
            </tr>
            <tr style="background: #f9fafb;">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Plataforma Web:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${platform || 'No especificada'}</td>
            </tr>
          </table>

          <div style="padding: 15px; background-color: ${isQualified ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isQualified ? '#bbf7d0' : '#e2e8f0'}; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;">Respuestas del Cuestionario</h3>
            <p style="margin: 5px 0;"><strong>Oferta / Ventas Activas:</strong> ${getLabel('hasValidatedOffer', hasValidatedOffer)}</p>
            <p style="margin: 5px 0;"><strong>Facturación Mensual:</strong> ${getLabel('revenue', revenue)}</p>
            <p style="margin: 5px 0;"><strong>Inversión Ads:</strong> ${getLabel('adSpend', adSpend)}</p>
          </div>

          ${comments ? `
            <div style="margin-top: 20px;">
              <p><strong>Comentarios / Tienda:</strong></p>
              <p style="background: #f3f4f6; padding: 10px; border-radius: 6px; font-size: 14px;">${comments}</p>
            </div>
          ` : ''}
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error enviando lead email:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
