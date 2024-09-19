const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5002; 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const saltRounds = 10;
// Middleware to parse JSON
app.use(express.json());
app.use(cors());
const User = require('./models/Users');
const uri = 'mongodb+srv://sabasiddiqi:Houston2024@cluster0.dpv1hqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.post('/register', async (req, res) => {
const { name, email, password } = req.body;
console.log("reached register\n");
try {
   
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
    name,
    email,
    password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Send token in the response
    res.status(201).json({ token });

} catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
}
});


// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      console.log('Login attempt'); // Log input data
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(400).send('User not found');
      }
      console.log('Plain password:', password);
        console.log('Hashed password from DB:', user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid credentials');
        return res.status(400).send('Invalid credentials');
      }
  
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      console.log('Token generated:', token);
      res.json({ token });
    } catch (err) {
      console.error('Error during login:', err); // Log the error
      res.status(500).send('Error logging in');
    }
  });
  
  

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('No token provided');
  
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
      if (err) return res.status(403).send('Invalid token');
      req.user = user;
      next();
    });
  }
  
  // Protect the profile route
  app.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('No token provided');
  
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).send('User not found');
      res.json({ name: user.name, email: user.email });
    } catch (err) {
      res.status(500).send('Error fetching user profile');
    }
  });
  
  
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
