const express = require("express");
const path = require("path");

// agar db.js hai to import (tumhare project me hai)
const Booking = require("./db");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// PUBLIC FOLDER (FRONTEND)
// ======================
app.use(express.static(path.join(__dirname, "public")));

// ======================
// HOME ROUTE
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// BOOKING API
// ======================
app.post("/submit-booking", async (req, res) => {
  try {
    const data = new Booking(req.body);
    await data.save();

    res.status(200).send("Booking Saved Successfully ✅");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error ❌ Booking not saved");
  }
});

// ======================
// HEALTH CHECK ROUTE (Render ke liye useful)
// ======================
app.get("/health", (req, res) => {
  res.send("Server is healthy ✅");
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});