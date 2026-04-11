const express = require("express");
const Booking = require("./db");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public folder serve karega
app.use(express.static("public"));

// root route (important)
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// API
app.post("/submit-booking", async (req, res) => {
  try {
    const data = new Booking(req.body);
    await data.save();

    res.send("Booking Saved Successfully ✅");
  } catch (err) {
    res.send("Error ❌");
  }
});

// ✅ only ONE listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});