const db = require('../config/db');

const userModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  create: async ({ username, email, password, role, receive_late_email }) => {
    let query = 'INSERT INTO users (username, email, password';
    let values = [username, email, password];
    if (role) {
      query += ', role';
      values.push(role);
    }
    if (typeof receive_late_email !== 'undefined') {
      query += ', receive_late_email';
      values.push(!!receive_late_email);
    }
    query += ') VALUES (?, ?, ?' + (role ? ', ?' : '') + (typeof receive_late_email !== 'undefined' ? ', ?' : '') + ')';
    const [result] = await db.query(query, values);
    return { id: result.insertId, username, email, role: role || 'student', receive_late_email: !!receive_late_email };
  },
  update: async (id, { username, email, password, role, receive_late_email }) => {
    let fields = [];
    let values = [];
    if (username) { fields.push('username = ?'); values.push(username); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (password) { fields.push('password = ?'); values.push(password); }
    if (role) { fields.push('role = ?'); values.push(role); }
    if (typeof receive_late_email !== 'undefined') { fields.push('receive_late_email = ?'); values.push(!!receive_late_email); }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = userModel;