const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const loanRoutes = require('./routes/loanRoutes');
const loanController = require('./controllers/loanController');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/loans', loanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

// Schedule overdue notifications daily at midnight
cron.schedule('0 0 * * *', loanController.sendOverdueNotifications);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});