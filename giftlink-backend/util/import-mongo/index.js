require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection URL with authentication options
const url = process.env.MONGO_URL;
const filename = path.join(__dirname, 'gifts.json');
const dbName = 'giftdb';
const collectionName = 'gifts';

// Load and parse the gifts data
function loadGiftsData() {
    try {
        const fileContent = fs.readFileSync(filename, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Handle different JSON structures
        return jsonData.docs || jsonData;
    } catch (error) {
        console.error('Error reading gifts file:', error.message);
        throw new Error(`Failed to load gifts data from ${filename}`);
    }
}

// Connect to database and insert data into the collection
async function loadData() {
    // Validate environment variable
    if (!url) {
        throw new Error('MONGO_URL environment variable is not set');
    }

    const client = new MongoClient(url);

    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log("Connected successfully to MongoDB server");

        // Database will be created if it does not exist
        const db = client.db(dbName);

        // Collection will be created if it does not exist
        const collection = db.collection(collectionName);
        
        // Check if collection already has documents
        const documentCount = await collection.countDocuments();

        if (documentCount === 0) {
            // Load data from file
            const data = loadGiftsData();
            
            // Validate data before inserting
            if (!Array.isArray(data) || data.length === 0) {
                console.log('No valid data to insert');
                return;
            }

            // Insert data into the collection
            const insertResult = await collection.insertMany(data);
            console.log(`Successfully inserted ${insertResult.insertedCount} documents`);
        } else {
            console.log(`Collection already contains ${documentCount} documents`);
        }
    } catch (err) {
        console.error('Database operation failed:', err.message);
        throw err;
    } finally {
        // Close the connection
        await client.close();
        console.log("Database connection closed");
    }
}

// Execute the data loading if this file is run directly
if (require.main === module) {
    loadData().catch(console.error);
}

module.exports = {
    loadData,
    loadGiftsData
};