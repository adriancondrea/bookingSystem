require('dotenv').config({path: `${__dirname}/.env`});
const verifyToken = require('./authMiddleware');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3001';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock user database
const users = {
  'user1': { password: 'password1', role: 'admin' },
  'user2': { password: 'password2', role: 'user' }
};

// Generate JWT Token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    const token = jwt.sign({ username, role: users[username].role }, process.env.TOKEN_KEY, { expiresIn: '24h' });
    return res.json({ token });
  }
  return res.status(401).send('Invalid Credentials');
});

// Secured route example
app.get('/api/properties', verifyToken, async (req, res) => {
  try {
      const response = await axios.get(`${PROPERTY_SERVICE_URL}/properties`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/api/properties', verifyToken, async (req, res) => {
    try {
        const response = await axios.post(`${PROPERTY_SERVICE_URL}/properties`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route to create a new booking
app.post('/api/bookings', verifyToken, async (req, res) => {
    try {
        const response = await axios.post(`${BOOKING_SERVICE_URL}/bookings`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route to retrieve all bookings
app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(`${BOOKING_SERVICE_URL}/bookings`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route to update a booking
app.put('/api/bookings/:id',verifyToken, async (req, res) => {
    try {
        const response = await axios.put(BOOKING_SERVICE_URL + `/bookings/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route to delete a booking
app.delete('/api/bookings/:id',verifyToken, async (req, res) => {
    try {
        await axios.delete(BOOKING_SERVICE_URL + `/bookings/${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});


app.listen(port, () => {
  console.log(`Booking Service listening at http://localhost:${port}`);
});

module.exports = app;