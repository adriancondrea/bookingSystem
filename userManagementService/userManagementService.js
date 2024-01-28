const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Ensure this model is created
require('dotenv').config();

const app = express();
const port = process.env.SERVICE_PORT || 3003;

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());

// POST route for creating a new user
app.post('/users', async (req, res) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
            // Include other fields as needed
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Respond with the created user (excluding the password)
        res.status(201).json({ username: savedUser.username, email: savedUser.email, id: savedUser._id });
    } catch (error) {
        // Handle errors (e.g., user already exists, validation errors)
        res.status(400).send(error.message);
    }
});

// POST - Authenticate a user
app.post('/users/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid Credentials');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET - Retrieve a user's profile
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) res.status(404).send('User not found');
    else res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT - Update a user's profile
app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// DELETE - Delete a user account
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(port, () => {
  console.log(`User Management Service listening at http://localhost:${port}`);
});
