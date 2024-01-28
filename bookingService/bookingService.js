require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('./models/Booking'); // Ensure this model file is created
const app = express();
const port = process.env.SERVICE_PORT || 3002;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB successfully connected"))
.catch(err => console.error(err));

app.use(express.json());
app.use((req, res, next) => {
    console.log(`Request received on instance at port ${process.env.SERVICE_PORT}`);
    next();
});


// POST endpoint to create a new booking
app.post('/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// GET endpoint to retrieve all bookings
app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.json(bookings);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// PUT endpoint to update a specific booking
app.put('/bookings/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBooking) {
            return res.status(404).send('Booking not found');
        }
        res.json(updatedBooking);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// DELETE endpoint to cancel/delete a booking
app.delete('/bookings/:id', async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).send('Booking not found');
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Booking Service listening at http://localhost:${port}`);
});

module.exports = app;
