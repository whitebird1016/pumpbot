const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    discord_id: {
        type: String,
    },
    key_type: {
        type: String,
    },
    key: {
        type: String,
    },
    ip_address: {
        type: String,
    },
    checkbind: {
        type: Boolean,
        default: false
    },
    expire_date: {
        type: Date,
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('user', UserSchema);