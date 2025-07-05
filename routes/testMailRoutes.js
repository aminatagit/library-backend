const express = require('express');
const router = express.Router();
const { sendLateReturnEmail } = require('../utils/mailer');

// Route de test d'envoi de mail
// POST /api/test-mail { to, bookTitle, returnDate }
router.post('/', async (req, res) => {
  const { to, bookTitle, returnDate } = req.body;
  if (!to || !bookTitle || !returnDate) {
    return res.status(400).json({ error: 'Champs requis : to, bookTitle, returnDate' });
  }
  try {
    await sendLateReturnEmail(to, bookTitle, returnDate);
    res.json({ message: `Mail de test envoyé à ${to}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
