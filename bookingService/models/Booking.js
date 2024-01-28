const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: String // e.g., "confirmed", "canceled"
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
