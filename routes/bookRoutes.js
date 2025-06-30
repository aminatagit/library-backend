const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

// Routes for book management
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', auth, bookController.addBook);
router.put('/:id', auth, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;