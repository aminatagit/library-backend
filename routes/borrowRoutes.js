const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Borrow a book
router.post('/', authenticate, async (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user.id;
  try {
    // Définir return_by à dans 2 minutes
    const now = new Date();
    const returnBy = new Date(now.getTime() + 2 * 60 * 1000); // +2 minutes
    const yyyy = returnBy.getFullYear();
    const mm = String(returnBy.getMonth() + 1).padStart(2, '0');
    const dd = String(returnBy.getDate()).padStart(2, '0');
    const hh = String(returnBy.getHours()).padStart(2, '0');
    const min = String(returnBy.getMinutes()).padStart(2, '0');
    const ss = String(returnBy.getSeconds()).padStart(2, '0');
    const returnByStr = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    await pool.query('INSERT INTO borrows (user_id, book_id, borrow_date, return_by) VALUES (?, ?, NOW(), ?)', [user_id, book_id, returnByStr]);
    res.status(201).json({ message: 'Book borrowed', return_by: returnByStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return a book
router.post('/return/:borrowId', authenticate, async (req, res) => {
  const { borrowId } = req.params;
  const userId = req.user.id;
  console.log(`[DEBUG] Tentative de remise : borrowId=`, borrowId, 'userId=', userId);
  if (!borrowId || isNaN(Number(borrowId))) {
    console.warn('[DEBUG] borrowId manquant ou invalide dans l’URL:', borrowId);
    return res.status(400).json({ error: 'borrowId manquant ou invalide dans l’URL.' });
  }
  try {
    // Vérifie si l'emprunt existe et appartient à l'utilisateur
    const [rows] = await pool.query('SELECT * FROM borrows WHERE id = ?', [borrowId]);
    if (rows.length === 0) {
      console.warn(`[DEBUG] Aucun emprunt trouvé pour borrowId=${borrowId}`);
      return res.status(404).json({ error: 'Aucun emprunt trouvé pour ce borrowId.' });
    }
    if (rows[0].user_id !== userId) {
      console.warn(`[DEBUG] Emprunt trouvé mais n'appartient pas à l'utilisateur connecté. user_id attendu: ${rows[0].user_id}, user connecté: ${userId}`);
      return res.status(403).json({ error: "Cet emprunt n'appartient pas à l'utilisateur connecté." });
    }
    // Effectue la remise
    const [result] = await pool.query('UPDATE borrows SET return_date = NOW() WHERE id = ? AND user_id = ?', [borrowId, userId]);
    if (result.affectedRows === 0) {
      console.warn(`[DEBUG] UPDATE n'a affecté aucune ligne pour borrowId=${borrowId}, userId=${userId}`);
      return res.status(404).json({ error: 'Aucun emprunt trouvé pour ce borrowId et cet utilisateur.' });
    }
    console.log(`[DEBUG] Remise réussie pour borrowId=${borrowId}, userId=${userId}`);
    res.json({ message: 'Book returned' });
  } catch (err) {
    console.error('[DEBUG] Erreur SQL lors de la remise:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's borrowing history (alias /my)
router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.book_id AS bookId, b.borrow_date AS borrowedAt, b.return_date AS returnBy, books.title
      FROM borrows b
      JOIN books ON b.book_id = books.id
      WHERE b.user_id = ?
      ORDER BY b.borrow_date DESC
    `, [req.user.id]);
    // Structure la réponse comme attendu
    const result = rows.map(row => ({
      id: row.id,
      bookId: row.bookId,
      borrowedAt: row.borrowedAt,
      returnBy: row.returnBy,
      book: { title: row.title }
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;