const ratingModel = require('../models/ratingModel');

const ratingController = {
  addRating: async (req, res) => {
    try {
      const { book_id, rating, comment } = req.body;
      if (!book_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Valid book ID and rating (1-5) are required' });
      }
      const user_id = req.user.id; // From auth middleware
      const newRating = await ratingModel.create({ user_id, book_id, rating, comment });
      res.status(201).json({ message: 'Rating added successfully', rating: newRating });
    } catch (error) {
      console.error('Error adding rating:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  getRatingsByBook: async (req, res) => {
    try {
      const ratings = await ratingModel.findByBookId(req.params.book_id);
      res.status(200).json(ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = ratingController;