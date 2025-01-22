const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Test route to check the API
router.get('/test', chatController.test);

// Example for creating a new session
router.post('/session', chatController.createSession);

module.exports = router;