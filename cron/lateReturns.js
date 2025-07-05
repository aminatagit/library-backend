const pool = require('../config/db');
const { sendLateReturnEmail } = require('../utils/mailer');

async function notifyLateReturns() {
  // Sélectionne les emprunts en retard et non rendus
  const [rows] = await pool.query(`
    SELECT b.id, b.return_date AS returnedAt, b.return_by AS returnBy, u.email, u.receive_late_email, books.title
    FROM borrows b
    JOIN users u ON b.user_id = u.id
    JOIN books ON b.book_id = books.id
    WHERE b.return_by < NOW()
      AND (b.return_date IS NULL OR b.return_date > b.return_by)
      AND (b.late_email_sent IS NULL OR b.late_email_sent = FALSE)
  `);

  for (const borrow of rows) {
    if (borrow.receive_late_email) {
      // Affiche la date/heure exacte de retour attendue
      let returnByStr = 'inconnue';
      if (borrow.returnBy instanceof Date) {
        returnByStr = borrow.returnBy.toLocaleString('fr-FR', { hour12: false });
      } else if (typeof borrow.returnBy === 'string') {
        returnByStr = borrow.returnBy.replace('T', ' ').slice(0, 16);
      }
      await sendLateReturnEmail(
        borrow.email,
        borrow.title,
        returnByStr
      );
      // Marque l'emprunt comme notifié pour ne pas renvoyer plusieurs fois
      await pool.query('UPDATE borrows SET late_email_sent = TRUE WHERE id = ?', [borrow.id]);
    }
  }
}

module.exports = notifyLateReturns;
