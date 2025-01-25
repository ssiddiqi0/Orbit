const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
