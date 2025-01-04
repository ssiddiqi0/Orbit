const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

app.use(express.json());
app.use(cors());

const User = require('./models/Users');
const Group = require('./models/Group');

// Hardcoded MongoDB URI
const uri = 'mongodb+srv://sabasiddiqi:Houston2024@cluster0.dpv1hqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Hardcoded JWT Secret
const JWT_SECRET = 'your_hardcoded_jwt_secret';

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please log in again.' });
      }
      return res.status(403).send('Invalid token');
    }
    req.user = user;
    next();
  });
}

// User Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// Token Refresh Endpoint
app.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.status(401).send('No token provided');

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');

    const newToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  });
});

// Protected Profile Route
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');
    res.json({ name: user.name, email: user.email, profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).send('Error fetching user profile');
  }
});

// Create Group
app.post('/groups', authenticateToken, async (req, res) => {
  const { name, description, members = [] } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    const creatorId = req.user.id;
    let memberIds = [];

    if (members.length > 0) {
      const users = await User.find({ email: { $in: members } }).select('_id');
      memberIds = users.map(user => user._id);
    }

    const newGroup = new Group({
      name,
      description,
      members: memberIds,
      admins: [creatorId],
      createdBy: creatorId,
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

// Get All Groups
app.get('/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'name email')
      .populate('admins', 'name email')
      .populate('createdBy', 'name email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

// Fetch specific group details
app.get('/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId)
      .populate('members', 'name email')
      .populate('admins', 'name email');
    if (!group) return res.status(404).json({ error: 'Group not found' });

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching group details', details: err.message });
  }
});

app.get('/user-groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      $or: [
        { members: userId },
        { admins: userId },
      ],
    })
      .populate('members', 'name email')
      .populate('admins', 'name email');

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

const PORT = 5002; // Hardcoded port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
