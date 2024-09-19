const mongoose = require('mongoose');
const { Schema } = mongoose;

// Group Schema
const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User schema
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User who created the group
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Group Model
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
