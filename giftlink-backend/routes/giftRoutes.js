const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Get all gifts
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const db = await connectToDatabase();

        const collection = db.collection("gifts");
        const gifts = await collection.find({}).toArray();
        res.json(gifts);
    } catch (e) {
        logger.error('oops something went wrong', e);
        next(e);
    }
});

// Get a single gift by ID
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const id = req.params.id;
        
        // Try to find by ObjectId first, then by custom id field
        let gift;
        if (ObjectId.isValid(id)) {
            gift = await collection.findOne({ _id: new ObjectId(id) });
        }
        if (!gift) {
            gift = await collection.findOne({ id: id });
        }

        if (!gift) {
            return res.status(404).json({ error: "Gift not found" });
        }

        res.json(gift);
    } catch (e) {
        logger.error('Error fetching gift by id', e);
        next(e);
    }
});

// Add a new gift
router.post('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        
        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body cannot be empty" });
        }
        
        const result = await collection.insertOne(req.body);
        
        // Get the inserted document
        const insertedGift = await collection.findOne({ _id: result.insertedId });
        
        res.status(201).json(insertedGift);
    } catch (e) {
        logger.error('Error creating gift', e);
        next(e);
    }
});

module.exports = router;