const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoURI = 'mongodb+srv://shai239:Shai7261@cluster0.tvsdydl.mongodb.net/usertracker?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  coffeeCount: { type: Number, default: 0 },
  cigCount: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// Routes

// Login or register
app.post('/login', async (req, res) => {
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

// Update counters
app.post('/update', async (req, res) => {
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

// Get user ranks
app.get('/ranks', async (req, res) => {
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


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
