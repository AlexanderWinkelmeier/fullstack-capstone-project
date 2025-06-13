```javascript
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const logger = require('./logger');
const expressPino = require('express-pino-logger')({ logger });
const natural = require("natural");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(expressPino);

// Definiere die Route zur Sentiment-Analyse
app.post('/sentiment', async (req, res) => {
    const { sentence } = req.query;

    if (!sentence) {
        logger.error('Keine Satz angegeben');
        return res.status(400).json({ error: 'Keine Satz angegeben' });
    }

    // Initialisiere den Sentiment-Analyzer mit Naturals PorterStemmer und der Sprache "Englisch"
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");

    // Führe die Sentiment-Analyse durch
    try {
        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";

        if (analysisResult < 0) {
            sentiment = "negativ";
        } else if (analysisResult > 0.33) {
            sentiment = "positiv";
        }

        // Protokolliere das Ergebnis
        logger.info(`Ergebnis der Sentiment-Analyse: ${analysisResult}`);
        // Antworte mit dem Ergebnis der Sentiment-Analyse
        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });
    } catch (error) {
        logger.error(`Fehler bei der Durchführung der Sentiment-Analyse: ${error}`);
        res.status(500).json({ message: 'Fehler bei der Durchführung der Sentiment-Analyse' });
    }
});

// Starte den Server
app.listen(port, () => {
    logger.info(`Server läuft auf Port ${port}`);
});