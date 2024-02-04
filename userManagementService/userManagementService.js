const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { startKafkaConsumer, consumer } = require('./kafkaConsumer');
const {sendWelcomeEmail} = require("./functions");

require('dotenv').config();

const app = express();
const port = process.env.SERVICE_PORT || 3003;

mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use((req, res, next) => {
    console.log(`Request received on instance at port ${process.env.SERVICE_PORT}`);
    next();
});

// Start Kafka Consumer
startKafkaConsumer().then(consumer => {
    console.log("Kafka Consumer started successfully.");
    // You can also handle consumer events or errors here
}).catch(err => {
    console.error("Failed to start Kafka Consumer:", err);
});

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

        sendWelcomeEmail(savedUser.email, savedUser.username);
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

const gracefulShutdown = async () => {
    console.log("Shutting down gracefully...");

    // Stop the server from accepting new connections
    server.close(async (err) => {
        if (err) {
            console.error("Error occurred during server shutdown:", err);
            process.exit(1);
        }

        // Disconnect the Kafka consumer
        try {
            await consumer.disconnect();
            console.log("Kafka Consumer disconnected successfully.");
        } catch (error) {
            console.error("Failed to disconnect Kafka Consumer:", error);
        }

        console.log("All services stopped, exiting now.");
        process.exit(0);
    });
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(port, () => {
  console.log(`User Management Service listening at http://localhost:${port}`);
});
