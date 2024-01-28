require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
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

startBookingListener();

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

async function startBookingListener() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'property_updates';

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    const q = await channel.assertQueue('', { exclusive: true });

    console.log("Waiting for property updates");
    channel.bindQueue(q.queue, exchange, '');

    channel.consume(q.queue, async function (msg) {
        if (msg.content) {
            console.log("Received property update:", msg.content.toString());
            const propertyUpdate = JSON.parse(msg.content.toString());
            try {
                // Process the property update
                await updateBookingsForProperty(propertyUpdate);

                console.log("Processed property update successfully.");
            } catch (error) {
                console.error("Error processing property update:", error);
            }
        }
    }, { noAck: true });
}

/**
 * Updates bookings for a property based on property updates.
 * @param {Object} propertyUpdate - Object containing details about the property update.
 */
async function updateBookingsForProperty(propertyUpdate) {
    // Example propertyUpdate structure:
    // { propertyId: '123', newAvailability: { startDate: '2021-01-01', endDate: '2021-01-10' }, ... }

    try {
        // Fetch affected bookings
        const affectedBookings = await Booking.find({
            propertyId: propertyUpdate.propertyId,
        });

        // Update each affected booking
        for (const booking of affectedBookings) {
            // Logic to update booking based on the property update
            // Here, we're simply marking the booking as needing review
            booking.status = 'Review Needed';
            await booking.save();
        }

        console.log(`Updated ${affectedBookings.length} bookings for property ${propertyUpdate.propertyId}`);
    } catch (error) {
        console.error('Error updating bookings:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}

module.exports = app;
