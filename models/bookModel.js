const db = require('../config/db');

const bookModel = {
  findAll: async (filters) => {
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];
    if (filters.title) {
      query += ' AND title LIKE ?';
      params.push(`%${filters.title}%`);
    }
    if (filters.author) {
      query += ' AND author LIKE ?';
      params.push(`%${filters.author}%`);
    }
    if (filters.genre) {
      query += ' AND genre = ?';
      params.push(filters.genre);
    }
    const [rows] = await db.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    return rows[0];
  },
  create: async ({ title, author, genre, published_year }) => {
    const [result] = await db.query(
      'INSERT INTO books (title, author, genre, published_year) VALUES (?, ?, ?, ?)',
      [title, author, genre, published_year]
    );
    return { id: result.insertId, title, author, genre, published_year };
  },
  update: async (id, { title, author, genre, published_year }) => {
    const [result] = await db.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, published_year = ? WHERE id = ?',
      [title, author, genre, published_year, id]
    );
    if (result.affectedRows === 0) return null;
    return { id, title, author, genre, published_year };
  },
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = bookModel;