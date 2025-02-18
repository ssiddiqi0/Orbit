const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const fs = require('fs');
const { DateTime } = require('luxon'); 
const multer = require('multer');
const path = require('path');
const Feedback = require('./models/Feedback');
const nodemailer = require('nodemailer');
app.use(express.json());
app.use(cors());
const allowedOrigins = [
  'https://ssiddiqi0.github.io', // ✅ Allow GitHub Pages
  'http://localhost:3000', // ✅ Allow Localhost for Development
];


app.use((req, res, next) => {
  const origin = req.header("Origin");
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.options('*', (req, res) => {
  res.sendStatus(200);
});
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
// Load environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const User = require('./models/Users');
const Group = require('./models/Group');
const Event = require('./models/Event'); 
const Post = require('./models/Post');
const AppUpdate = require('./models/AppUpdates');
const Itinerary = require('./models/Itinerary');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
const ACCESS_CODE = process.env.ACCESS_CODE 
const uri =process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Hardcoded JWT Secret
const JWT_SECRET = 'your_hardcoded_jwt_secret';
// Set up the transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
const sendEmail = async (to, subject, content, isHtml = false) => {
  try {
    const mailOptions = {
      from: `"Orbit Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      [isHtml ? 'html' : 'text']: content, // Sends HTML if true, otherwise plain text
    };
    await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};


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
app.post('/app-updates', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const update = new AppUpdate({ title, description });
    await update.save();
    res.status(201).json(update);
  } catch (err) {
    console.error('Error creating app update:', err);
    res.status(500).json({ error: 'Failed to create app update' });
  }
});

// Fetch all app updates (For you and users to view)
app.get('/app-updates', async (req, res) => {
  try {
    const updates = await AppUpdate.find().sort({ createdAt: -1 }); // Show latest first
    res.status(200).json(updates);
  } catch (err) {
    console.error('Error fetching app updates:', err);
    res.status(500).json({ error: 'Failed to fetch app updates' });
  }
});
app.post('/feedback', async (req, res) => {
  const { feedback } = req.body;
  if (!feedback || feedback.trim() === '') {
    return res.status(400).json({ error: 'Feedback cannot be empty' });
  }

  try {
    const newFeedback = new Feedback({ message: feedback });
    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

app.get('/feedback', async (req, res) => {
  const { code } = req.query;
  if (code !== ACCESS_CODE) {
    return res.status(403).json({ error: "Forbidden: Invalid access code" });
  }

  try {
    const feedbackList = await Feedback.find().sort({ timestamp: -1 });

    // ✅ Format feedback as a readable HTML page
    let feedbackHTML = `
      <html>
      <head>
        <title>Feedback List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f8f8f8; }
          h1 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { background: white; padding: 10px; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          strong { color: #f794ba; }
        </style>
      </head>
      <body>
        <h1>Submitted Feedback</h1>
        <ul>
          ${feedbackList.map(f => `<li><strong>${new Date(f.timestamp).toLocaleString('en-US', { timeZone: 'America/Vancouver' })}:</strong> ${f.message}</li>`).join('')}
        </ul>
      </body>
      </html>`;

    res.send(feedbackHTML);
  } catch (err) {
    console.error('Error retrieving feedback:', err);
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});


// User Registration
app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use. Please use a different email.' });
  }

  // Password security check
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  if (password.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return res.status(400).json({ error: 'Password does not meet security requirements.' });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Error registering user' });
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
    const creatorId = req.user.id; // Admin's ID from JWT
    console.log("Creator ID:", creatorId);

    // Convert provided members to user IDs
    const users = await User.find({ email: { $in: members } }).select('_id email name');
    const memberIds = users.map((user) => user._id);
    
    // Ensure the admin's ID is in the `members` array
    if (!memberIds.includes(creatorId)) {
      memberIds.push(creatorId); // Add admin directly by ID
    }

    // Create and save the group
    const newGroup = new Group({
      name,
      description,
      members: memberIds, // Include all members' IDs and admin's ID
      admins: [creatorId], // Add admin as an admin
      createdBy: creatorId,
    });

    const savedGroup = await newGroup.save();
    console.log("Saved Group:", savedGroup);

    // 📩 Send Email Notification to All Added Members
    const emails = users.map(user => user.email);
    const subject = `You've Been Added to ${name}!`;

    // 🌟 Correct Group Link
    const groupLink = `https://ssiddiqi0.github.io/Orbit/#/group/${savedGroup._id}`;

    // 📩 Simple Email Notification
    const html = `
      <div style="background: #965796 !important; color: #FFF6FD !important; font-family: 'Lora', serif; text-align: center; padding: 25px; border-radius: 15px; max-width: 500px; margin: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">
        
        <h2 style="color: #FFF6FD !important; font-size: 24px; margin-bottom: 5px;">🪐 You've Been Added to a Group on Orbit!</h2>

        <p style="font-size: 18px; color: #FFF6FD !important; margin-bottom: 15px;">
          <strong>Group:</strong> ${name}
        </p>

        <p style="color: #FFF6FD !important; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          You have been added to the group <strong>${name}</strong>. Click below to check it out!
        </p>

        <hr style="border: 0; height: 1px; background: #D8BFD8; margin: 20px auto; width: 80%;">

        <a href="${groupLink}" style="display: inline-block; background: #FFF6FD; color: #965796 !important; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);">
          View Group
        </a>

      </div>
    `;

    emails.forEach(email => sendEmail(email, subject, html, true));

    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
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
      .populate('members', 'name email profilePicture')
      .populate('admins', 'name email profilePicture');
    if (!group) return res.status(404).json({ error: 'Group not found' });

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching group details', details: err.message });
  }
});

// ADD and REMOVE Members
app.post('/groups/:groupId/members', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const group = await Group.findById(groupId).populate('members', 'email name');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.members.some(member => member._id.toString() === user._id.toString())) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add the user to the group
    group.members.push(user._id);
    await group.save();

    // 📩 Send Email Notification to All Group Members
    const emails = group.members.map(member => member.email);
    const subject = `New Member in ${group.name}: ${user.name}`;

    // 🌟 Correct Group Link
    const groupLink = `https://ssiddiqi0.github.io/Orbit/#/group/${groupId}`;

    // 📩 Simple Email Notification
    const html = `
      <div style="background: #965796 !important; color: #FFF6FD !important; font-family: 'Lora', serif; text-align: center; padding: 25px; border-radius: 15px; max-width: 500px; margin: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">
        
        <h2 style="color: #FFF6FD !important; font-size: 24px; margin-bottom: 5px;">🎉 New Member Joined!</h2>

        <p style="font-size: 18px; color: #FFF6FD !important; margin-bottom: 15px;">
          <strong>Group:</strong> ${group.name}
        </p>

        <p style="color: #FFF6FD !important; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          <strong>${user.name}</strong> has just joined your group! Welcome them to the team. 🎊
        </p>

        <hr style="border: 0; height: 1px; background: #D8BFD8; margin: 20px auto; width: 80%;">

        <a href="${groupLink}" style="display: inline-block; background: #FFF6FD; color: #965796 !important; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);">
          View Group
        </a>

      </div>
    `;

    emails.forEach(email => sendEmail(email, subject, html, true));

    res.status(200).json({ message: 'Member added successfully', newMember: user });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/groups/:groupId/members/:memberId', authenticateToken, async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id; // Current user ID from token

  if (userId === memberId) {
    return res.status(400).json({ error: "You can't remove yourself from the group." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.members.includes(memberId)) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }

    group.members = group.members.filter((id) => id.toString() !== memberId);
    await group.save();

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal server error' });
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
app.get('/groups/:groupId/events', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id; // ID of the currently logged-in user
  const googleAccountId = req.headers['google-account-id']; // Pass this from frontend if needed

  try {
    // Fetch all events for the group
    const events = await Event.find({ group: groupId }).lean();

    // Process events to categorize them as personal or group events
    const processedEvents = events.map((event) => {
      if (event.user.toString() === userId && event.googleAccountId === googleAccountId) {
        // Personal event (belongs to the logged-in user's Google account)
        return { ...event, type: 'personal' };
      }
      // Group event (from other users)
      return { ...event, type: 'group', title: 'Busy' }; // Mask group events as "Busy"
    });

    res.status(200).json(processedEvents);
  } catch (err) {
    console.error('Error fetching group events:', err);
    res.status(500).json({ error: 'Error fetching events', details: err.message });
  }
});



// Save user events to a group
app.post('/groups/:groupId/sync-events', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { events } = req.body;

  if (!events || events.length === 0) {
    return res.status(400).json({ error: 'No events provided' });
  }

  try {
    const userId = req.user.id;

    // Filter out duplicate events
    const uniqueEvents = [];
    for (const event of events) {
      const existingEvent = await Event.findOne({
        googleEventId: event.googleEventId,
        group: groupId,
      });

      if (!existingEvent) {
        uniqueEvents.push({
          user: userId,
          group: groupId,
          googleEventId: event.googleEventId,
          title: event.title || 'No Title',
          start: event.start,
          end: event.end,
          type: 'personal', // Assume these are personal if syncing from Google
        });
      }
    }

    // Insert unique events
    if (uniqueEvents.length > 0) {
      await Event.insertMany(uniqueEvents);
    }

    // Fetch all events for the group
    const allEvents = await Event.find({ group: groupId }).lean();

    // Process events: mask as "Busy" for group events or keep personal
    const processedEvents = allEvents.map((event) => ({
      ...event,
      type: event.user.toString() === userId ? 'personal' : 'group',
      title: event.user.toString() === userId ? event.title : 'Busy', // Mask group events
    }));

    res.status(200).json(processedEvents);
  } catch (err) {
    console.error('Error syncing events:', err);
    res.status(500).json({ error: 'Error syncing events', details: err.message });
  }
});


app.post('/mock-events', async (req, res) => {
  const { userEmail, groupId } = req.body;

  if (!userEmail || !groupId) {
    return res.status(400).json({ error: 'User email and group ID are required' });
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure `googleEventId` is unique for mock events
    const mockEvents = [
      {
        googleEventId: 'mock-event-1', // Unique ID for the mock event
        title: 'Team Meeting',
        start: new Date('2025-01-10T10:00:00'),
        end: new Date('2025-01-10T11:00:00'),
        user: user._id,
        group: groupId,
      },
      {
        googleEventId: 'mock-event-2',
        title: 'Project Deadline',
        start: new Date('2025-01-12T15:00:00'),
        end: new Date('2025-01-12T16:00:00'),
        user: user._id,
        group: groupId,
      },
      {
        googleEventId: 'mock-event-3',
        title: 'Coffee Break',
        start: new Date('2025-01-14T14:00:00'),
        end: new Date('2025-01-14T14:30:00'),
        user: user._id,
        group: groupId,
      },
    ];

    console.log('Mock Events to Insert:', mockEvents);

    await Event.insertMany(mockEvents);

    res.status(201).json({ message: 'Mock events created successfully' });
  } catch (err) {
    console.error('Error creating mock events:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});
app.post('/groups/:groupId/posts', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { type, heading, description, pollOptions } = req.body;

  if (type !== 'poll' && !description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const newPost = new Post({
      group: groupId,
      user: req.user.id,
      type,
      heading,
      description,
      pollOptions: type === 'poll' ? pollOptions.map((option) => ({ option, votes: 0 })) : undefined,
    });

    await newPost.save();

    // 📩 Send Email to All Group Members
    const group = await Group.findById(groupId).populate('members', 'email name');
    const emails = group.members.map(member => member.email);

    const subject = `${type.charAt(0).toUpperCase() + type.slice(1)} Post in ${group.name}: ${heading}`;

    // 🌟 Correct Group Link
    const groupLink = `https://ssiddiqi0.github.io/Orbit/#/group/${groupId}`;

    // 🎨 Exact Orbit-Themed Email with Your Colors
    const html = `
  <div style="background: #965796 !important; color: #FFF6FD !important; font-family: 'Lora', serif; text-align: center; padding: 25px; border-radius: 15px; max-width: 500px; margin: auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);">
    
    <h2 style="color: #FFF6FD !important; font-size: 24px; margin-bottom: 5px;">💌 New Post in Your Group</h2>

    <p style="font-size: 18px; color: #FFF6FD !important; margin-bottom: 15px;">
      <strong>Group:</strong> ${group.name}
    </p>

    <h3 style="color: #FFF6FD !important; font-size: 22px; margin-bottom: 15px;">
      ${heading}
    </h3>

    <p style="color: #FFF6FD !important; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
      ${description || 'No description provided.'}
    </p>

    <hr style="border: 0; height: 1px; background: #D8BFD8; margin: 20px auto; width: 80%;">

    <a href="${groupLink}" style="display: inline-block; background: #FFF6FD; color: #965796 !important; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);">
      View Post
    </a>

  </div>
`;
    emails.forEach(email => sendEmail(email, subject, html, true));

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post', details: err.message });
  }
});


app.get('/groups/:groupId/posts', authenticateToken, async (req, res) => {
  const { groupId } = req.params;

  try {
    const posts = await Post.find({ group: groupId }).populate('user', 'name email');
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

app.post('/posts/:postId/vote', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { optionId } = req.body; // Option the user voted for
  const userId = req.user.id; // User's ID from JWT

  try {
    const post = await Post.findById(postId);
    if (!post || post.type !== 'poll') {
      return res.status(400).json({ error: 'Invalid poll post' });
    }

    // Remove the user from any previous vote
    post.pollOptions.forEach((option) => {
      const voterIndex = option.voters.indexOf(userId);
      if (voterIndex > -1) {
        option.voters.splice(voterIndex, 1);
        option.votes -= 1;
      }
    });

    // Add the user's vote to the selected option
    const selectedOption = post.pollOptions.id(optionId);
    if (!selectedOption) {
      return res.status(404).json({ error: 'Option not found' });
    }

    selectedOption.voters.push(userId);
    selectedOption.votes += 1;

    await post.save();
    const updatedPost = await Post.findById(postId).populate('user', 'name email');
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error voting:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

app.post('/profile/photo', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  const { profilePicture } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');

    if (req.file) {
      // If a file is uploaded, use its path
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (profilePicture) {
      // If a URL is provided, use it
      user.profilePicture = profilePicture;
    } else {
      return res.status(400).json({ error: 'No photo or URL provided' });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating profile photo:', err);
    res.status(500).send('Error updating profile photo');
  }
});

// Endpoint for removing the profile photo
app.delete('/profile/photo', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');

    // Reset profile photo to default
    user.profilePicture = 'https://i.pinimg.com/564x/81/70/7e/81707e9a95a49d5b3cd94a7ba3d71a22.jpg';
    await user.save();

    res.json(user);
  } catch (err) {
    console.error('Error removing profile photo:', err);
    res.status(500).send('Error removing profile photo');
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// GEMINI
app.post('/api/generate-itinerary', async (req, res) => {
  const { destination, days, details } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: 'Destination and number of days are required' });
  }

  try {
    // Create the prompt dynamically
    const prompt = `Plan a ${days}-day trip to ${destination}. Include activities, dining options, travel tips, and must-see landmarks. Here are some additional details to keep in mind about the trip: ${details}`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Return the generated itinerary
    res.status(200).json({ itinerary: response.text() });
  } catch (err) {
    console.error('Error generating itinerary:', err);
    res.status(500).json({ error: 'Failed to generate itinerary. Please try again later.' });
  }
});

app.post('/groups/:groupId/itineraries', async (req, res) => {
  const { groupId } = req.params;
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    const newItinerary = new Itinerary({
      groupId,
      name,
      content,
    });

    const savedItinerary = await newItinerary.save();
    res.status(201).json(savedItinerary);
  } catch (err) {
    console.error('Error saving itinerary:', err);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

app.get('/groups/:groupId/itineraries', async (req, res) => {
  const { groupId } = req.params;

  try {
    const itineraries = await Itinerary.find({ groupId });
    res.status(200).json(itineraries);
  } catch (err) {
    console.error('Error fetching itineraries:', err);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});


app.put('/groups/:groupId/itineraries/:itineraryId', async (req, res) => {
  const { groupId, itineraryId } = req.params;
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' });
  }

  try {
    const updatedItinerary = await Itinerary.findOneAndUpdate(
      { _id: itineraryId, groupId },
      { name, content },
      { new: true } // Return the updated document
    );

    if (!updatedItinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    res.status(200).json(updatedItinerary);
  } catch (err) {
    console.error('Error updating itinerary:', err);
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
});

app.delete('/groups/:groupId/itineraries/:itineraryId', async (req, res) => {
  const { groupId, itineraryId } = req.params;

  try {
    const deletedItinerary = await Itinerary.findOneAndDelete({
      _id: itineraryId,
      groupId,
    });

    if (!deletedItinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    console.error('Error deleting itinerary:', err);
    res.status(500).json({ error: 'Failed to delete itinerary' });
  }
});


const PORT = 5002; // Hardcoded port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
