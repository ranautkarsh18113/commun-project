const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protectRoute } = require('../middlewares/authMiddleware');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const normalizedUsername = username.trim().toLowerCase();

        // Check duplicate
        const existingUser = await User.findOne({ username: normalizedUsername });
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: normalizedUsername,
            password: hashedPassword
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ _id: newUser._id, username: newUser.username, token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Username is already taken" });
        }
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const normalizedUsername = username.trim().toLowerCase();
        const user = await User.findOne({ username: normalizedUsername });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ _id: user._id, username: user.username, token });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// Verify saved session on page refresh
router.get('/me', protectRoute, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ _id: user._id, username: user.username });
    } catch (error) {
        console.log("LOGIN ERROR: ", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;