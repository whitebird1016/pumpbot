const mongoose = require('mongoose');
const config = require('config');
const User = require('../models/User');
const db = config.get('mongoURI');
console.log(db)


const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected...');
        await User.collection.createIndex({ expire_date: 1 }, { expireAfterSeconds: 0 });

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;