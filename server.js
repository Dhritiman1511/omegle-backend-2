require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// MongoDB connection
connectDB();

// Express app setup
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

require('./sockets/signaling')(io, redisClient);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));