
// Backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Répartition des notes (valeurs aléatoires pour test)
router.get('/stats/ratings', verifyAdmin, async (req, res) => {
  // Répartition réelle des notes depuis la base
  try {
    const [rows] = await pool.query('SELECT rating, COUNT(*) as count FROM ratings GROUP BY rating');
    // Toujours retourner 5 valeurs (1 à 5)
    const data = [];
    for (let i = 1; i <= 5; i++) {
      const found = rows.find(r => r.rating === i || r.rating == i);
      data.push({ rating: i, count: found ? found.count : 0 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, isAdmin FROM users');
    // Pour compatibilité frontend : renvoyer isAdmin: true/false selon la colonne ou le rôle
    const users = rows.map(u => ({
      ...u,
      isAdmin: u.isAdmin === 1 || u.role === 'admin'
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add user
router.post('/users', verifyAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }
  try {
    // On n'impose plus l'unicité de l'email
    // Hash du mot de passe
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, role]);
    // Renvoie la liste à jour
    const [rows] = await pool.query('SELECT id, username, email, role FROM users');
    res.status(201).json({ message: 'Utilisateur ajouté.', users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  if (!username && !email && !password && !role) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });
  }
  try {
    // Vérifie si l'utilisateur existe
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    const fields = [];
    const values = [];
    if (username) { fields.push('username = ?'); values.push(username); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
    // Renvoie la liste à jour
    const [rows] = await pool.query('SELECT id, username, email, role FROM users');
    res.json({ message: 'Utilisateur mis à jour.', users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Supprimer d'abord les ratings liés
    await pool.query('DELETE FROM ratings WHERE user_id = ?', [id]);
    // Puis les emprunts liés
    await pool.query('DELETE FROM borrows WHERE user_id = ?', [id]);
    // Puis l'utilisateur
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    // Renvoie la liste à jour
    const [rows] = await pool.query('SELECT id, username, email, role FROM users');
    res.json({ message: 'Utilisateur supprimé.', users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add book
router.post('/books', verifyAdmin, async (req, res) => {
  const { title, author, genre } = req.body;
  try {
    await pool.query('INSERT INTO books (title, author, genre) VALUES (?, ?, ?)', [title, author, genre]);
    res.status(201).json({ message: 'Book added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit book
router.put('/books/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, published_year, available } = req.body;
  try {
    // Build dynamic query for partial update
    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (author !== undefined) { fields.push('author = ?'); values.push(author); }
    if (genre !== undefined) { fields.push('genre = ?'); values.push(genre); }
    if (published_year !== undefined) { fields.push('published_year = ?'); values.push(published_year); }
    if (available !== undefined) { fields.push('available = ?'); values.push(available); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete book
router.delete('/books/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rating distribution
// Pie chart : répartition des rôles utilisateurs (valeurs aléatoires pour test)
router.get('/stats/roles', verifyAdmin, async (req, res) => {
  const data = [
    { role: 'admin', count: Math.floor(Math.random() * 5) + 1 },
    { role: 'student', count: Math.floor(Math.random() * 20) + 5 }
  ];
  res.json(data);
});

// Get borrowing trends (last 5 months)
router.get('/stats/borrows', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') as month, COUNT(*) as count
      FROM borrows
      WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    const labels = [];
    const data = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      labels.push(`${month} ${year}`);
      const row = rows.find(r => r.month === `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
      data.push(row ? row.count : 0);
    }
    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Statistiques sur les commentaires (nombre de commentaires par mois, 5 derniers mois)
// Top 5 livres par nombre de commentaires (valeurs aléatoires pour test)
router.get('/stats/comments', verifyAdmin, async (req, res) => {
  const books = [
    'Éthiopiques',
    "L'Enfant noir",
    'Peau noire, masques blancs',
    'Une si longue lettre',
    'L’Aventure ambiguë'
  ];
  const data = books.map(title => ({ title, count: Math.floor(Math.random() * 10) + 1 }));
  res.json(data);
});