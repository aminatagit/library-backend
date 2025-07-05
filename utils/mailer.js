const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aminataouedraogo.dev@gmail.com',
    pass: 'clgm kjos jmls nhfv'
  }
});

// Test de connexion SMTP au démarrage
transporter.verify(function(error, success) {
  if (error) {
    console.error('[MAILER] Erreur de connexion SMTP:', error);
  } else {
    console.log('[MAILER] Connexion SMTP réussie, prêt à envoyer des mails.');
  }
});

async function sendLateReturnEmail(to, bookTitle, returnDate) {
  try {
    await transporter.sendMail({
      from: '"Bibliothèque" <aminataouedraogo.dev@gmail.com>',
      to,
      replyTo: 'aminataouedraogo.dev@gmail.com',
      subject: `Retard de retour pour le livre "${bookTitle}"`,
      text: `Bonjour,\n\nVous avez dépassé la date de retour (${returnDate}) pour le livre "${bookTitle}". Merci de le rapporter rapidement.\n\nCordialement,\nLa bibliothèque`
    });
    console.log(`[MAILER] Mail envoyé à ${to} pour le livre "${bookTitle}" (retard)`);
  } catch (err) {
    console.error(`[MAILER] Erreur envoi mail à ${to} pour le livre "${bookTitle}":`, err);
  }
}

module.exports = { sendLateReturnEmail };
