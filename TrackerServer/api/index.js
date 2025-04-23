const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors({ origin: "*" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next(); 
});

app.use(express.json());

// Helper functions for reading/writing JSON file
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeData(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// Routes
const router = express.Router();

router.post("/login", (req, res) => {
  const { username } = req.body;
  let users = readData();
  let user = users.find((u) => u.username === username);

  if (!user) {
    user = { username, coffeeCount: 0, cigCount: 0 };
    users.push(user);
    writeData(users);
  }

  res.json(user);
});

router.post("/update", (req, res) => {
  const { username, coffeeCount, cigCount } = req.body;
  let users = readData();
  let user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.coffeeCount = coffeeCount;
  user.cigCount = cigCount;
  writeData(users);

  res.json(user);
});

router.get("/ranks", (req, res) => {
  let users = readData();
  users.sort((a, b) => b.coffeeCount + b.cigCount - (a.coffeeCount + a.cigCount));
  res.json(users);
});

app.use("/api", router);

module.exports = app;
module.exports.handler = serverless(app);

// Run locally
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Local JSON server running at http://localhost:${PORT}`);
  });
}
