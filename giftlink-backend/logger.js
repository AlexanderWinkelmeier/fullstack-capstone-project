const pino = require('pino');

let logger;

try {
    if (process.env.NODE_ENV !== 'production') {
        // In non-production environments, log to the console with pretty formatting
        logger = pino({
            level: process.env.LOG_LEVEL || 'debug',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            },
        });
    } else {
        // Production environment - structured JSON logging
        logger = pino({
            level: process.env.LOG_LEVEL || 'info',
            formatters: {
                level: (label) => {
                    return { level: label };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        });
    }
} catch (error) {
    // Fallback logger if pino-pretty is not available
    console.warn('Failed to initialize pino logger:', error.message);
    logger = pino({
        level: process.env.LOG_LEVEL || 'info'
    });
}

module.exports = logger;