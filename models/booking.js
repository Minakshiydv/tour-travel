const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  location: String,
  vehicle: String,
  days: Number,
  paymentMode: String,
  paymentId: String
});

module.exports = mongoose.model("Booking", bookingSchema);