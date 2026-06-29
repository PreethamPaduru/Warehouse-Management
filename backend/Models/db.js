const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set.');
    }

    cachedConnection = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
    });

    try {
        await cachedConnection;
        console.log('Connected to MongoDB');
        return cachedConnection;
    } catch (err) {
        cachedConnection = null;
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
};

module.exports = connectDB;
