const Session = require('../models/Session');
const logger = require('../utils/logger');

// Test endpoint
exports.test = (req, res) => {
  logger.info('Test endpoint hit');
  res.status(200).json({ message: 'API is working!' });
};

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
      logger.warn('Missing user information in request');
      return res.status(400).json({ error: 'Both user1 and user2 are required' });
    }

    const session = new Session({ user1, user2 });
    await session.save();

    logger.info(`Session created: ${session._id}`);
    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    logger.error(`Error creating session: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};