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

//Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Connect to database
    const db = await connectToDatabase();

    // Access MongoDB collection
    const collection = db.collection('users');

    // Check for existing email
    const existingEmail = await collection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);

    // Save user details in database
    const newUser = await collection.insertOne({
      email,
      firstName,
      lastName,
      password: hash,
      createdAt: new Date(),
    });

    // Create JWT authentication with user._id as payload
    const payload = {
      user: {
        id: newUser.insertedId,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);
    logger.info('User registered successfully');
    res.json({ authtoken, email });
  } catch (e) {
    logger.error('Error during registration:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Connect to database
    const db = await connectToDatabase();
    const collection = db.collection('users');

    // Check if user exists
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Verify password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);
    logger.info('User logged in successfully');
    res.json({
      authtoken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (e) {
    logger.error('Error during login:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
