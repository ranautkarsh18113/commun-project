const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: "" }
}, { timestamps: true });

// Indexing participants allows rapid retrieval of a user's active chats
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);