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
    type: Schema.Types.ObjectId,
    ref: 'User',  // Refers to the User schema
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Refers to the User who created the group
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',  // Refers to the User schema
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',  // Assuming you have or will have a Post schema
  }]
}, { timestamps: true });

// Group Model
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
