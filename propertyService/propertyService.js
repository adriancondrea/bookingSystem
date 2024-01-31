require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const Property = require('./models/Property'); // Ensure this model file is created
const app = express();
const port = process.env.SERVICE_PORT|| 3001;
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Request received on instance at port ${process.env.SERVICE_PORT}`);
    next();
});


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB successfully connected"))
.catch(err => console.error(err));

// Routes for Property Service
app.get('/properties', async (req, res) => {
try {
const properties = await Property.find({});
res.json(properties);
} catch (error) {
res.status(500).send(error.message);
}
});

app.post('/properties', async (req, res) => {
    if (!req.body.title || !req.body.location) {
    return res.status(400).send('Title and location are required');
  }
    try {
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
    } catch (error) {
    res.status(500).send(error.message);
    }
});

// PUT endpoint to update property details
app.put('/properties/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const updates = req.body;

        const updatedProperty = await Property.findByIdAndUpdate(propertyId, updates, { new: true });
        if (!updatedProperty) {
            return res.status(404).send('Property not found');
        }

        // Publish update to RabbitMQ
        await publishPropertyUpdate({ propertyId, ...updates });

        res.json(updatedProperty);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/properties/:id', async (req, res) => {
    try {
    const propertyId = req.params.id;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
    return res.status(404).send('Property not found');
    }
    res.status(204).send();
    } catch (error) {
    res.status(500).send(error.message);
    }
});

app.listen(port, () => {
console.log(`Property Service listening at http://localhost:${port}`);
});

async function publishPropertyUpdate(propertyDetails) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'property_updates';

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(propertyDetails)));

    console.log("Published property update");
    setTimeout(function() { connection.close(); }, 500);
}

module.exports = app;