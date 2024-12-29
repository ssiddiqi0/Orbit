const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: 'https://i.pinimg.com/564x/81/70/7e/81707e9a95a49d5b3cd94a7ba3d71a22.jpg'
  }

});

module.exports = mongoose.model('User', UserSchema);
