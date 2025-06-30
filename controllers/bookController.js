const bookModel = require('../models/bookModel');

const bookController = {
  // Get all books with optional filters
  getAllBooks: async (req, res) => {
    try {
      const { title, author, genre } = req.query;
      const filters = { title, author, genre };
      const books = await bookModel.findAll(filters);
      res.status(200).json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get a book by ID
  getBookById: async (req, res) => {
    try {
      const book = await bookModel.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json(book);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add a new book
  addBook: async (req, res) => {
    try {
      const { title, author, genre, published_year } = req.body;
      if (!title || !author || !genre || !published_year) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const book = await bookModel.create({ title, author, genre, published_year });
      res.status(201).json({ message: 'Book added successfully', book });
    } catch (error) {
      console.error('Error adding book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update a book
  updateBook: async (req, res) => {
    try {
      const { title, author, genre, published_year } = req.body;
      const book = await bookModel.update(req.params.id, { title, author, genre, published_year });
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json({ message: 'Book updated successfully', book });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete a book
  deleteBook: async (req, res) => {
    try {
      const result = await bookModel.delete(req.params.id);
      if (!result) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = bookController;