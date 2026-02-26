import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@algoritmiadesarrollos.com.ar',
      pass: 'Qpzm123Qpzm-', // Testing password seen in source code
    },
    debug: true, // show debug output
    logger: true // log information in console
  });

  try {
    const info = await transporter.sendMail({
      from: '"Test" <info@algoritmiadesarrollos.com.ar>',
      to: 'algoritmiadesarrollos@gmail.com, info@algoritmiadesarrollos.com.ar',
      subject: 'Test Email Server',
      text: 'Hello world',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

testEmail();
