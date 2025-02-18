const mongoose = require('mongoose');

const AppUpdateSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Update title (e.g., "Added Group Chat")
  description: { type: String, required: true }, // Details of the update
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model('AppUpdate', AppUpdateSchema);
