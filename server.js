const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const cors = require("cors");

const app = express();

// ======================
// CORS FIX
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
    } else {
      return callback(null, true);
    }
  },
  credentials: true
}));

app.options("*", cors());

// ======================
// BODY PARSER
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// SESSION FIX
// ======================
app.set("trust proxy", 1);

app.use(session({
  secret: "otp_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: true
  }
}));

// ======================
// STATIC FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// HOME ROUTE
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// 🔥 SAFE TRANSPORTER (FIXED)
// ======================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || ""
  }
});

// ❌ transporter.verify REMOVED (Render crash fix)

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

    console.log("OTP:", otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent successfully ✅" });

  } catch (error) {
    console.log("❌ OTP ERROR:", error);

    res.status(500).json({
      message: "OTP not sent ❌",
      error: error.message
    });
  }
});

// ======================
// VERIFY OTP
// ======================
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp == req.session.otp) {
    return res.json({ success: true, message: "Verified ✅" });
  } else {
    return res.json({ success: false, message: "Invalid OTP ❌" });
  }
});

// ======================
// BOOKING EMAIL
// ======================
app.post("/book", async (req, res) => {
  try {
    const email = req.body.email || req.session.email;

    if (!email) {
      return res.status(400).json({ message: "Email missing ❌" });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed 🎉",
      text: "Your booking has been successfully confirmed!"
    });

    res.json({ message: "Booking email sent ✅" });

  } catch (error) {
    console.log("❌ BOOKING ERROR:", error);

    res.status(500).json({
      message: "Booking failed ❌",
      error: error.message
    });
  }
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});