require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const cors = require("cors");

const app = express();

// ======================
// BODY PARSER
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// CORS
// ======================
app.use(cors({
  origin: true,
  credentials: true
}));

// ======================
// SESSION
// ======================
app.set("trust proxy", 1);

app.use(session({
  secret: "otp_secret_key_123",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // local = false
    httpOnly: true
  }
}));

// ======================
// STATIC FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// MONGODB (SAFE)
// ======================
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rdrBooking")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// ======================
// MODEL
// ======================
const Booking = require("./models/booking");

// ======================
// NODEMAILER
// ======================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ======================
// BOOK API
// ======================
app.post("/book", async (req, res) => {
  try {
    console.log("BOOK API HIT");
    console.log(req.body);

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      vehicle,
      days,
      paymentMode,
      paymentId
    } = req.body;

    // VALIDATION
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields ❌" });
    }

    // SAVE IN DB
    const booking = new Booking({
      firstName,
      lastName,
      email,
      phone,
      location,
      vehicle,
      days,
      paymentMode,
      paymentId: paymentId || "CASH"
    });

    await booking.save();

    // EMAIL SEND (SAFE)
    try {
      await transporter.sendMail({
        from: `"Travel Booking" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Booking Confirmed 🎉",
        html: `
          <h2>🎉 Booking Confirmed</h2>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Location:</b> ${location}</p>
          <p><b>Vehicle:</b> ${vehicle}</p>
          <p><b>Days:</b> ${days}</p>
          <p><b>Payment Mode:</b> ${paymentMode}</p>
        `
      });
    } catch (mailErr) {
      console.log("EMAIL ERROR:", mailErr.message);
    }

    res.json({ message: "Booking saved + email sent ✅" });

  } catch (error) {
    console.log("BOOK ERROR:", error);
    res.status(500).json({
      message: "Booking failed ❌",
      error: error.message
    });
  }
});

// ======================
// HOME ROUTE
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});