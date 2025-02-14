const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Automatically store date & time
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
