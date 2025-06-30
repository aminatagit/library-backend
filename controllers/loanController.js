const nodemailer = require('nodemailer');
const loanModel = require('../models/loanModel');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const loanController = {
  borrowBook: async (req, res) => {
    try {
      const { book_id } = req.body;
      const user_id = req.user.id;
      const borrow_date = new Date();
      const due_date = new Date();
      due_date.setDate(borrow_date.getDate() + 14); // 2-week loan
      const loan = await loanModel.create({ user_id, book_id, borrow_date, due_date });
      res.status(201).json({ message: 'Book borrowed successfully', loan });
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  returnBook: async (req, res) => {
    try {
      const { loan_id } = req.body;
      const result = await loanModel.returnBook(loan_id);
      if (!result) {
        return res.status(404).json({ message: 'Loan not found' });
      }
      res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  sendOverdueNotifications: async () => {
    try {
      const overdueLoans = await loanModel.findOverdue();
      for (const loan of overdueLoans) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: loan.email,
          subject: 'Overdue Book Reminder',
          text: `Dear user, the book "${loan.title}" is overdue. Please return it by ${loan.due_date}.`,
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  },
};

module.exports = loanController;