import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email, telefono, servicios, mensaje } = req.body;

  // Credenciales de Hostinger (Usando variables de entorno o directas si es prueba local)
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar', 
      pass: process.env.EMAIL_PASS || 'Qpzm123Qpzm-' 
    },
  });

  try {
    // 1. Mail para vos (Aviso de Lead)
    await transporter.sendMail({
      from: `"Web Algoritmia" <${process.env.EMAIL_USER || 'info@algoritmiadesarrollos.com.ar'}>`,
      to: 'info@algoritmiadesarrollos.com.ar', // A donde te llega
      replyTo: email, // Para responderle directo al cliente al dar "Responder"
      subject: `Nuevo Lead Web: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #6d28d9;">Nuevo mensaje desde la web</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
          
          <p><strong>¿Qué está buscando?</strong></p>
          <ul style="background: #f0edfa; padding: 10px 20px; border-radius: 5px;">
            ${servicios && servicios.length > 0 
              ? servicios.map(s => `<li>${s}</li>`).join('') 
              : '<li>No especificó servicios</li>'
            }
          </ul>

          <p><strong>Mensaje:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #6d28d9;">
            ${mensaje || 'El usuario no agregó detalles adicionales.'}
          </blockquote>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error SMTP:', error);
    return res.status(500).json({ error: error.message });
  }
}
