const express = require('express');
const { protectRoute } = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { upload } = require('../config/cloudinary');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Fetch historical messages for a specific conversation
router.get('/:conversationId', protectRoute, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
                                      .sort({ createdAt: 1 }); // Chronological order
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve messages" });
    }
});

// Upload an image and save it as a message
router.post('/uploadImage', protectRoute, upload.single('image'), async (req, res) => {
    try {
        const { conversationId } = req.body;
        const imageUrl = req.file.path; // Cloudinary URL

        const newMessage = await Message.create({
            conversationId,
            sender: req.user.id,
            imageUrl: imageUrl
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Image upload failed" });
    }
});

module.exports = router;