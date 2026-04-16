const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
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