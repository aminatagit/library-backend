const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');

router.post('/borrow', auth, loanController.borrowBook);
router.post('/return', auth, loanController.returnBook);

module.exports = router;