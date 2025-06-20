//Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Import Pino logger

//Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

dotenv.config();

//Step 1 - Task 4: Create JWT secret with validation
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET exists
if (!JWT_SECRET) {
  logger.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Validation rules for registration
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Das Passwort muss mindestens 8 Zeichen lang sein')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Das Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Vorname ist erforderlich')
    .isAlpha('de-DE', { ignore: ' -' })
    .withMessage('Vorname darf nur Buchstaben enthalten'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Nachname ist erforderlich')
    .isAlpha('de-DE', { ignore: ' -' })
    .withMessage('Nachname darf nur Buchstaben enthalten')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Passwort ist erforderlich')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validierungsfehler',
      errors: errors.array()
    });
  }
  return null;
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  const payload = {
    user: {
      id: userId,
    },
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h' // Token expires in 24 hours
  });
};

// Registration route
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { firstName, lastName, email, password } = req.body;

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      logger.error('Database connection failed:', dbError);
      return res.status(503).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }

    // Access MongoDB collection
    const collection = db.collection('users');

    // Check for existing email
    const existingEmail = await collection.findOne({ email });
    if (existingEmail) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'E-Mail-Adresse bereits registriert' });
    }

    // Hash password with higher salt rounds for better security
    const salt = await bcryptjs.genSalt(12);
    const hash = await bcryptjs.hash(password, salt);

    // Save user details in database
    const newUser = await collection.insertOne({
      email,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hash,
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    // Verify user was created successfully
    if (!newUser.insertedId) {
      logger.error('Failed to create user in database');
      return res.status(500).json({ message: 'Benutzer konnte nicht erstellt werden' });
    }

    // Create JWT authentication with user._id as payload
    const authtoken = generateToken(newUser.insertedId);
    
    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ 
      message: 'Registrierung erfolgreich',
      authtoken, 
      user: {
        email,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }
    });
  } catch (e) {
    logger.error('Error during registration:', e);
    return res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// Login route
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email, password } = req.body;

    // Connect to database
    let db;
    try {
      db = await connectToDatabase();
    } catch (dbError) {
      logger.error('Database connection failed:', dbError);
      return res.status(503).json({ message: 'Datenbankverbindung fehlgeschlagen' });
    }

    const collection = db.collection('users');

    // Check if user exists and is active
    const user = await collection.findOne({ email, isActive: true });
    if (!user) {
      logger.warn(`Login attempt with non-existent or inactive email: ${email}`);
      return res.status(400).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Verify password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(400).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Update last login timestamp
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Create JWT token
    const authtoken = generateToken(user._id);
    
    logger.info(`User logged in successfully: ${email}`);
    res.json({
      message: 'Anmeldung erfolgreich',
      authtoken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin
      },
    });
  } catch (e) {
    logger.error('Error during login:', e);
    return res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// Optional: Password reset request route (basic implementation)
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
], async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { email } = req.body;

    const db = await connectToDatabase();
    const collection = db.collection('users');

    const user = await collection.findOne({ email, isActive: true });
    
    // Always return success message for security (don't reveal if email exists)
    logger.info(`Password reset requested for: ${email}`);
    res.json({ 
      message: 'Falls die E-Mail-Adresse existiert, wurde eine Passwort-Reset-E-Mail gesendet' 
    });

    // TODO: Implement actual password reset email sending logic here
    
  } catch (e) {
    logger.error('Error during password reset request:', e);
    return res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

module.exports = router;