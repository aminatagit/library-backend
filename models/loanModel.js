const db = require('../config/db');

const loanModel = {
  create: async ({ user_id, book_id, borrow_date, due_date }) => {
    const [result] = await db.query(
      'INSERT INTO loans (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)',
      [user_id, book_id, borrow_date, due_date] 
    );
    await db.query('UPDATE books SET available = FALSE WHERE id = ?', [book_id]);
    return { id: result.insertId, user_id, book_id, borrow_date, due_date };
  },
  returnBook: async (loan_id) => {
    const [result] = await db.query(
      'UPDATE loans SET return_date = CURDATE() WHERE id = ?',
      [loan_id]
    );
    const [loan] = await db.query('SELECT book_id FROM loans WHERE id = ?', [loan_id]);
    if (loan[0]) {
      await db.query('UPDATE books SET available = TRUE WHERE id = ?', [loan[0].book_id]);
    }
    return result.affectedRows > 0;
  },
  findOverdue: async () => {
    const [rows] = await db.query(
      'SELECT l.id, l.user_id, l.book_id, l.due_date, u.email, b.title ' +
      'FROM loans l ' +
      'JOIN users u ON l.user_id = u.id ' +
      'JOIN books b ON l.book_id = b.id ' +
      'WHERE l.return_date IS NULL AND l.due_date < CURDATE()'
    );
    return rows;
  },
};

module.exports = loanModel;