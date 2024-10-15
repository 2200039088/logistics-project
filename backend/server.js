const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Enable parsing JSON bodies in requests

// MongoDB Atlas Connection URI
const mongoURI = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.qu1zycp.mongodb.net/your_database_name?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'driver'], required: true },
  licenseNumber: { type: String },
  vehicleDetails: { type: String },
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Simple route to verify server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Logistics Platform API!');
});


router.post('/api/bookings', async (req, res) => {
  const { name, address, mobile, pickupLocation, dropOffLocation, vehicleType, estimatedCost, distance } = req.body;

  try {
    const newBooking = new Booking({
      name,
      address,
      mobile,
      pickupLocation,
      dropOffLocation,
      vehicleType,
      estimatedCost,
      distance,
    });
    await newBooking.save();
    res.status(200).json({ message: 'Booking successful!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ message: 'Booking failed.' });
  }
});


// User Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, licenseNumber, vehicleDetails } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      licenseNumber: role === 'driver' ? licenseNumber : undefined,
      vehicleDetails: role === 'driver' ? vehicleDetails : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Create a JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Return the token and role in the response
      res.json({ message: 'Login successful!', token, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});