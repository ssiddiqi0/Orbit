const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['tweet', 'reminder', 'poll'],
  },
  heading: {
    type: String,
  },
  description: {
    type: String,
  },
  pollOptions: [
    {
      option: String,
      votes: {
        type: Number,
        default: 0,
      },
      voters: [String], // Array of user IDs who voted for this option
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
