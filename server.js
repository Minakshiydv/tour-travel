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
// SESSION CONFIG (Render FIX)
// ======================
app.set("trust proxy", 1);

app.use(session({
  secret: "otp_secret_key_123",
  resave: true, // Ise true rakhein taaki session refresh hota rahe
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 1000 * 60 * 15 // 15 minutes validity
  }
}));

// ======================
// STATIC FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// NODEMAILER (Fixed for ENETUNREACH)
// ======================
// Yahan maine Port 587 aur TLS settings daali hain jo Render par block nahi hoti
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 ke liye hamesha false rehta hai
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Connection errors se bachne ke liye
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
    
    // Session mein OTP save karna
    req.session.otp = otp;
    req.session.email = email;

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
    res.status(500).json({ message: "OTP not sent ❌", error: error.message });
  }
});

// ======================
// VERIFY OTP API
// ======================
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  
  console.log("Session OTP:", req.session.otp);

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
// HOME ROUTES (NO * USED HERE)
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