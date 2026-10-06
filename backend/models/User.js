const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "https://api.dicebear.com/7.x/bottts/svg" },
    isOnline: { type: Boolean, default: false },
    themePreference: { type: String, default: "light" }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);