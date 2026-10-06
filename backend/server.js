const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Database Connection (Deprecated options removed)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connection Established");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Routes
app.use('/api/auth', authRoutes);

// Socket.IO Configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room and send persistent history from MongoDB
    socket.on('join_conversation', async (conversationId) => {
        socket.join(conversationId);
        try {
            const history = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(50);
            socket.emit('load_history', history);
        } catch (err) {
            console.error("Error loading history:", err);
        }
    });

    // Save message to database and broadcast to room
    socket.on('send_message', async (data) => {
        try {
            const savedMessage = await Message.create({
                conversationId: data.conversationId,
                sender: data.sender,
                text: data.text,
                gifUrl: data.gifUrl
            });

            // Broadcast to other clients in the room
            socket.to(data.conversationId).emit('receive_message', savedMessage);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Gateway operating on port ${PORT}`);
});