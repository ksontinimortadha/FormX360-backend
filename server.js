const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://formx360.vercel.app"], // Allow your frontend domain
    credentials: true, // Allow cookies, if necessary
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

// Routes
app.use("/users", require("./routes/userRoutes"));
app.use("/forms", require("./routes/formRoutes"));
app.use("/responses", require("./routes/responseRoutes"));
app.use("/companies", require("./routes/companyRoutes"));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));
app.options(
  "*",
  cors({
    origin: ["https://formx360.vercel.app"], // Allow your frontend domain
    credentials: true, // Allow cookies, if necessary
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

// Server should run independently of MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Server is running!");
});
