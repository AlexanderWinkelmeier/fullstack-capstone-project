// db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;
const dbName = "giftdb";

let dbInstance = null;
let client = null;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        client = new MongoClient(url);
        await client.connect();
        dbInstance = client.db(dbName);
        console.log("Connected to MongoDB");
        return dbInstance;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        dbInstance = null;
        console.log("MongoDB connection closed");
    }
}

module.exports = { connectToDatabase, closeConnection };