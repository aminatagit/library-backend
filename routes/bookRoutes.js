
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Récupérer les commentaires d'un livre
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT r.comment, u.username AS author, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ? AND r.comment IS NOT NULL AND r.comment != ''
      ORDER BY r.created_at DESC
    `, [id]);
    // Structure la réponse comme attendu
    const result = rows.map(row => ({
      comment: row.comment,
      author: row.author,
      rating: row.rating,
      createdAt: row.created_at
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route utilisée par le frontend
// Nouvelle version : inclut rating (moyenne) et borrowCount pour chaque livre
router.get('/', async (req, res) => {
  const { q, genre, topRated } = req.query;
  let query;
  let params = [];
  if (topRated === 'true') {
    // Top rated books: moyenne des notes, au moins 1 note, trié par note moyenne décroissante, max 6 livres
    query = `
      SELECT b.id, b.title, b.author, b.genre,
             IFNULL(AVG(r.rating), 0) as rating,
             (SELECT COUNT(*) FROM borrows br WHERE br.book_id = b.id) as borrowCount
      FROM books b
      LEFT JOIN ratings r ON b.id = r.book_id
      GROUP BY b.id
      HAVING rating > 0
      ORDER BY rating DESC, borrowCount DESC
      LIMIT 6
    `;
  } else {
    query = `
      SELECT b.id, b.title, b.author, b.genre,
             IFNULL(AVG(r.rating), 0) as rating,
             (SELECT COUNT(*) FROM borrows br WHERE br.book_id = b.id) as borrowCount
      FROM books b
      LEFT JOIN ratings r ON b.id = r.book_id
      WHERE 1=1
    `;
    if (q) {
      query += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (genre) {
      query += ' AND b.genre = ?';
      params.push(genre);
    }
    query += ' GROUP BY b.id ORDER BY b.title ASC';
  }
  try {
    const [rows] = await pool.query(query, params);
    // On force le type number pour rating et borrowCount
    const result = rows.map(row => ({
      id: row.id,
      title: row.title,
      author: row.author,
      genre: row.genre,
      rating: row.rating ? Number(row.rating) : 0,
      borrowCount: row.borrowCount ? Number(row.borrowCount) : 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recherche avec filtre
router.get('/search', async (req, res) => {
  const { q, genre } = req.query;
  let query = 'SELECT * FROM books WHERE 1=1';
  const params = [];
  if (q) {
    query += ' AND (title LIKE ? OR author LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }
  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupération par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
