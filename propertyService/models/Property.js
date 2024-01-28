const mongoose = require('mongoose');

// Property Schema
const propertySchema = new mongoose.Schema({
title: String,
description: String,
price: Number,
location: String,
amenities: [String],
images: [String],
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
