const db = require('../config/db');

const ratingModel = {
  create: async ({ user_id, book_id, rating, comment }) => {
    const [result] = await db.query(
      'INSERT INTO ratings (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, book_id, rating, comment]
    );
    return { id: result.insertId, user_id, book_id, rating, comment };
  },
  findByBookId: async (book_id) => {
    const [rows] = await db.query('SELECT * FROM ratings WHERE book_id = ?', [book_id]);
    return rows;
  },
};

module.exports = ratingModel;