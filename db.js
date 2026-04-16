const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/rdrBooking")
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

  const bookingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  location: String,
  vehicle: String,
  paymentMode: String,
  paymentId: String
});

module.exports = mongoose.model("Booking", bookingSchema);