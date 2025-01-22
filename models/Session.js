const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user1: { type: String, required: true },
  user2: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);