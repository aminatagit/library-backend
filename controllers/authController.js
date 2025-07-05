const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      console.log('Register endpoint hit. Body received:', req.body);
      const { username, email, password, role, receive_late_email } = req.body;

      // Validate input
      if (!username || !email || !password) {
        console.warn('Registration failed: missing fields', { username, email, password });
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      let user;
      try {
        user = await userModel.create({ username, email, password: hashedPassword, role, receive_late_email });
      } catch (err) {
        console.error('Error creating user in DB:', err);
        // Gestion explicite de l'unicité de l'email
        if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
          return res.status(400).json({ message: "Cet email est déjà utilisé. Veuillez en choisir un autre." });
        }
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Generate JWT avec le rôle
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Envoi d'un mail de bienvenue/confirmation d'inscription
      try {
        const { sendLateReturnEmail } = require('../utils/mailer');
        await sendLateReturnEmail(
          user.email,
          'Bienvenue à la bibliothèque',
          new Date().toLocaleString('fr-FR', { hour12: false })
        );
        console.log(`[MAILER] Mail de bienvenue envoyé à ${user.email}`);
      } catch (mailErr) {
        console.error(`[MAILER] Erreur lors de l'envoi du mail de bienvenue à ${user.email}:`, mailErr);
      }

      console.log('User registered successfully:', { id: user.id, email: user.email, role: user.role, receive_late_email: user.receive_late_email });
      res.status(201).json({ message: 'User registered successfully', token, role: user.role, receive_late_email: user.receive_late_email });
    } catch (error) {
      console.error('Registration error (outer catch):', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      console.log('Login endpoint hit. Body received:', req.body);
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        console.warn('Login failed: missing fields', { email, password });
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user exists
      const user = await userModel.findByEmail(email);
      if (!user) {
        console.warn('Login failed: user not found for email', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.warn('Login failed: invalid password for email', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT avec le rôle
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      console.log('Login successful for user:', { id: user.id, email: user.email, role: user.role });
      res.status(200).json({ message: 'Login successful', token, role: user.role });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = authController;