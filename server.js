const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const cors = require("cors");

const app = express();

// ======================
// CORS CONFIG
// ======================
const allowedOrigins = [
  "https://tour-travel1.onrender.com",
  "https://rdrtravels.in"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); 
  },
  credentials: true
}));

app.options(/.*/, cors());

// ======================
// BODY PARSER
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION CONFIG (Render Fix)
// ======================
app.set("trust proxy", 1);

app.use(session({
  secret: "otp_secret_key_123",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 1000 * 60 * 15 // 15 mins
  }
}));

// ======================
// STATIC FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// NODEMAILER (IPv4 FIX FOR ENETUNREACH)
// ======================
const transporter = nodemailer.createTransport({
  host: "74.125.130.108", // Direct Google SMTP IPv4 address
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
});

// ======================
// SEND OTP API
// ======================
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required ❌" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = otp;
    req.session.email = email;

    // Manual session save
    req.session.save((err) => {
      if (err) console.error("Session Save Error:", err);
    });

    console.log("OTP GENERATED:", otp);

    await transporter.sendMail({
      from: `"Luxury Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent successfully ✅" });

  } catch (error) {
    console.error("❌ OTP ERROR:", error.message);
    res.status(500).json({ 
      message: "OTP not sent ❌", 
      error: error.message 
    });
  }
});

// ======================
// VERIFY OTP API
// ======================
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  if (!req.session.otp) {
    return res.json({ success: false, message: "Session expired ❌" });
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
    const email = req.body.email || req.session.email;
    if (!email) return res.status(400).json({ message: "Email missing ❌" });

    await transporter.sendMail({
      from: `"Luxury Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Booking Confirmed 🎉",
      text: "Your booking has been successfully confirmed!"
    });

    res.json({ message: "Booking email sent ✅" });
  } catch (error) {
    res.status(500).json({ message: "Booking failed ❌", error: error.message });
  }
});

// ======================
// HOME ROUTES
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));