const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debugging Middleware (Logs all incoming requests)
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Routes (Use /api prefix for better compatibility with Vercel)
app.use("/users", require("./routes/userRoutes"));
app.use("/responses", require("./routes/responseRoutes"));
app.use("/companies", require("./routes/companyRoutes"));

// Root Route (Check if the server is running)
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB(); // Connect to MongoDB after starting the server
});
