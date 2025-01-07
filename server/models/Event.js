const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
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
  googleEventId: {
    type: String, // Unique Google Calendar event ID
    unique: true, // Prevent duplicates
    required: true,
  },
  title: {
    type: String,
    default: 'Busy',
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
