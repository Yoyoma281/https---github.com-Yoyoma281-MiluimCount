const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());
const allowedOrigins = [
  'https://https-github-com-yoyoma281-m-git-d6da55-shais-projects-f6bbc652.vercel.app/',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  coffeeCount: { type: Number, default: 0 },
  cigCount: { type: Number, default: 0 },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Routes

app.post('/api/login', async (req, res) => {
  const { username } = req.body;

  try {
    let user = await User.findOne({ username });

    if (!user) {
      user = new User({ username });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/update', async (req, res) => {
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
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/ranks', async (req, res) => {
  try {
    const users = await User.find().lean();

    const sortedUsers = users.sort((a, b) =>
      (b.coffeeCount + b.cigCount) - (a.coffeeCount + a.cigCount)
    );

    res.json(sortedUsers);
  } catch (err) {
    console.error('Ranks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = serverless(app);
