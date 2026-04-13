const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const cors = require("cors");

const Booking = require("./db");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "otp_secret",
  resave: false,
  saveUninitialized: true
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
// EMAIL CONFIG
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rdrtourandtravels@gmail.com",
    pass: "dtpn gjfw nctz qzj"
  }
});

// ======================
// SEND OTP
// ======================
app.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email;

    const otp = Math.floor(100000 + Math.random() * 900000);

    console.log("OTP sent to:", email);
    console.log("OTP:", otp);

    req.session.otp = otp;
    req.session.email = email;

    await transporter.sendMail({
      from: "rdrtourandtravels@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent successfully ✅" });

  } catch (error) {
    console.log("OTP Error:", error);
    res.status(500).json({ message: "OTP not sent ❌" });
  }
});

// ======================
// VERIFY OTP
// ======================
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp == req.session.otp) {
    res.json({ success: true, message: "Verified ✅" });
  } else {
    res.json({ success: false, message: "Invalid OTP ❌" });
  }
});

// ======================
// BOOKING EMAIL (FINAL FIXED)
// ======================
app.post("/book", async (req, res) => {
  try {
    console.log("🔥 BOOK ROUTE HIT");

    const email = req.body.email || req.session.email;

    console.log("BOOK EMAIL:", email);

    if (!email) {
      return res.status(400).json({ message: "Email missing ❌" });
    }

    await transporter.sendMail({
      from: "rdrtourandtravels@gmail.com",
      to: email,
      subject: "Booking Confirmed 🎉",
      text: "Your booking has been successfully confirmed!"
    });

    console.log("📩 Booking email sent");

    res.json({ message: "Booking email sent ✅" });

  } catch (error) {
    console.log("Booking Error:", error);
    res.status(500).json({ message: "Booking failed ❌" });
  }
});

// ======================
// SERVER START
// ======================


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});