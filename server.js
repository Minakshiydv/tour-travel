require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
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
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true
  }
}));

// ======================
// STATIC FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// MONGODB
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


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));



// ======================
// SEND OTP
// ======================
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required ❌" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = otp;
    req.session.email = email;

    const { error } = await resend.emails.send({
      from: "RDR Tour & Travels <onboarding@resend.dev>",
      to: email,
      subject: "Your RDR Tour & Travels verification code",
      text: `Hello,

Your verification code is: ${otp}

This code expires in 10 minutes.
If you did not request this code, please ignore this email.

RDR Tour & Travels`
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ message: "OTP email nahi bheja ja saka" });
    }

    res.json({ message: "OTP sent ✅" });

  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ message: "OTP bhejne mein error hua" });
  }
});
// ======================
// VERIFY OTP  (FIXED - NO MORE 404)
// ======================
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (!req.session.otp) {
    return res.status(400).json({ success: false, message: "Session expired ❌" });
  }

  if (parseInt(otp) === req.session.otp) {
    return res.json({ success: true, message: "Verified ✅" });
  } else {
    return res.json({ success: false, message: "Invalid OTP ❌" });
  }
});

// ======================
// BOOKING API
// ======================
app.post("/book", async (req, res) => {
  try {
    console.log("BOOK API HIT:", req.body);

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

    // SAVE DB
    const booking = new Booking({
      firstName,
      lastName,
      email,
      phone,
      location: location || "",
      vehicle: vehicle || "",
      days: days || 1,
      paymentMode: paymentMode || "cash",
      paymentId: paymentId || "CASH"
    });

    await booking.save();

    // EMAIL SAFE (NO CRASH)
    
// EMAIL SAFE (NO CRASH)
try {
  const ratePerDay = Number(vehicle) || 0;
  const totalAmount = ratePerDay * (Number(days) || 0);

  const { error } = await resend.emails.send({
    from: "RDR Tour & Travels <onboarding@resend.dev>",
    to: email,
    subject: "Your RDR Tour & Travels Booking Details",
    html: `
      <h2>Booking Received 🎉</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for choosing RDR Tour &amp; Travels.</p>
      <p><b>Destination:</b> ${location}</p>
      <p><b>Vehicle rate:</b> ₹${ratePerDay.toLocaleString("en-IN")} / day</p>
      <p><b>Duration:</b> ${days} days</p>
      <p><b>Payment method:</b> ${paymentMode}</p>
      <p><b>Estimated total:</b> ₹${totalAmount.toLocaleString("en-IN")}</p>
      <p>We’ll contact you at <b>${phone}</b> to discuss trip arrangements.</p>
      <p>Warm regards,<br>RDR Tour &amp; Travels</p>
    `
  });

  if (error) {
    console.error("Booking email error:", error);
  }
} catch (mailErr) {
  console.error("Booking email error:", mailErr.message);
}
   // if (transporter) {
     // try {
       // await transporter.sendMail({
         // from: process.env.EMAIL_USER,
          //to: email,
          //subject: "Booking Confirmed 🎉",
          //html: `
            //<h2>🎉 Booking Confirmed</h2>
            //<p><b>Name:</b> ${firstName} ${lastName}</p>
    //
    //
    //        <p><b>Phone:</b> ${phone}</p>
      //      <p><b>Location:</b> ${location}</p>
        //    <p><b>Vehicle:</b> ${vehicle}</p>
          //  <p><b>Days:</b> ${days}</p>
            //<p><b>Payment:</b> ${paymentMode}</p>
          //});
      //} catch (mailErr) {
      //  console.log("EMAIL ERROR:", mailErr.message);
     // }
    //}

    res.json({ message: "Booking saved ✅" });

  } catch (error) {
    console.log("BOOK ERROR:", error);
    res.status(500).json({
      message: "Booking failed ❌",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});