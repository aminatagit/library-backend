const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou autre service SMTP
  auth: {
    user: 'aminataouedraogo.dev@gmail.com', 
    pass: 'clgm kjos jmls nhfv' 
  }
});

async function sendLateReturnEmail(to, bookTitle, returnDate) {
  try {
    await transporter.sendMail({
      from: '"Bibliothèque" <aminataouedraogo.dev@gmail.com>',
      to,
      subject: `Retard de retour pour le livre "${bookTitle}"`,
      text: `Bonjour,\n\nVous avez dépassé la date de retour (${returnDate}) pour le livre "${bookTitle}". Merci de le rapporter rapidement.\n\nCordialement,\nLa bibliothèque`
    });
    console.log(`Mail envoyé à ${to} pour le livre "${bookTitle}" (retard)`);
  } catch (err) {
    console.error('Erreur envoi mail:', err);
  }
}

module.exports = { sendLateReturnEmail };
