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
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3003';

// Middleware
app.use(cors({
  origin: 'http://localhost:3010'  // Specify the origin of the frontend app
}));
app.use(bodyParser.json());

// Route for registering a new user
app.post('/api/users', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route for user login
app.post('/api/users/login', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/users/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route for retrieving a user profile
app.get('/api/users/:id', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route for updating a user profile
app.put('/api/users/:id', verifyToken, async (req, res) => {
    try {
        const response = await axios.put(`${USER_SERVICE_URL}/users/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

// Route for deleting a user
app.delete('/api/users/:id', verifyToken, async (req, res) => {
    try {
        await axios.delete(`${USER_SERVICE_URL}/users/${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

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

app.put('/api/properties/:id', verifyToken, async (req, res) => {
    try {
        const response = await axios.put(`${PROPERTY_SERVICE_URL}/properties/${req.params.id}`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response.status).send(error.response.data);
    }
});

app.delete('/api/properties/:id', verifyToken, async (req, res) => {
   try {
       console.log("deleting property with id ", req.params.id);
       const response = await axios.delete(`${PROPERTY_SERVICE_URL}/properties/${req.params.id}`);
         res.status(204).send();
   }
   catch (error) {
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