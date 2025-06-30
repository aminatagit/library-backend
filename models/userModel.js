const db = require('../config/db');

const userModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  create: async ({ username, email, password }) => {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return { id: result.insertId, username, email };
  },
};

module.exports = userModel;