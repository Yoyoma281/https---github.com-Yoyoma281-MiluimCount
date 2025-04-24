const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: "*" }));

// Optional: manually set CORS headers as a fallback
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Optional: allowCors wrapper (use for raw Node.js-style serverless functions if needed)
const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// Optional: example standalone handler (you can test this separately)
const timeHandler = (req, res) => {
  const d = new Date();
  res.end(d.toString());
};

// Export this if needed separately:
// module.exports = allowCors(timeHandler);

app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://shai239:Shai7261@cluster0.tvsdydl.mongodb.net/usertracker';

if (!mongoURI) {
  console.error("❌ MONGODB_URI not set in .env file");
  process.exit(1); // Exit to avoid undefined connection
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  coffeeCount: { type: Number, default: 0 },
  cigCount: { type: Number, default: 0 },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Routes
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/update", async (req, res) => {
  const { username, coffeeCount, cigCount } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { username },
      { coffeeCount, cigCount },
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/ranks", async (req, res) => {
  try {
    const users = await User.find().lean();
    const sortedUsers = users.sort(
      (a, b) => b.coffeeCount + b.cigCount - (a.coffeeCount + a.cigCount)
    );
    res.json(sortedUsers);
  } catch (err) {
    console.error("Ranks error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use("/api", router);

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
