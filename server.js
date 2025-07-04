// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Planification de la notification des retards
const cron = require('node-cron');
const notifyLateReturns = require('./cron/lateReturns');
// Toutes les 2 minutes
cron.schedule('*/2 * * * *', notifyLateReturns);