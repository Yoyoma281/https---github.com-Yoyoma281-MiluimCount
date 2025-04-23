import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [username, setUsername] = useState('');
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [cigCount, setCigCount] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState('');

  const serverUrl = 'https://tracke-server.vercel.app/api';
  // const serverUrl = 'http://localhost:3000/api'; // Change this to your server URL

  const loginUser = async (name) => {
    try {
      const response = await axios.post(`${serverUrl}/login`, { username: name });
      setUsername(response.data.username);
      setCoffeeCount(response.data.coffeeCount);
      setCigCount(response.data.cigCount);
      localStorage.setItem('username', name); // Save username to localStorage
      fetchRanking();
    } catch (error) {
      setError('Error logging in');
    }
  };

  const updateCounters = async () => {
    try {
      const response = await axios.post(`${serverUrl}/update`, {
        username,
        coffeeCount,
        cigCount,
      });
      setCoffeeCount(response.data.coffeeCount);
      setCigCount(response.data.cigCount);
      fetchRanking();
    } catch (error) {
      setError('Error updating counters');
    }
  };

  const fetchRanking = async () => {
    try {
      const response = await axios.get(`${serverUrl}/ranks`);
      setRanking(response.data);
    } catch (error) {
      setError('Error fetching rankings');
    }
  };

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      loginUser(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetchRanking();
    }
  }, [username]);

  if (!username) {
    return (
      <div className="p-4 text-center min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xs">
          <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
          <input
            type="text"
            placeholder="Enter your name"
            className="border p-2 rounded w-full mb-4"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => {
              if (usernameInput.trim()) {
                loginUser(usernameInput.trim());
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full active:scale-95 transition"
          >
            Log In
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-300 p-4 text-center font-sans">
      <h1 className="text-4xl font-extrabold mb-4 text-zinc-800">☕🚬 Daily Tracker</h1>
      <h2 className="text-xl mb-6 text-zinc-600">
        Hello, <span className="font-semibold">{username}</span>
      </h2>

      <div className="flex justify-center gap-10 mb-6 flex-wrap">
        <div className="bg-white shadow p-4 rounded-lg w-40">
          <p className="text-lg font-medium mb-2">☕ Coffee: {coffeeCount}</p>
          <button
            onClick={() => setCoffeeCount((prev) => prev + 1)}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded w-full active:scale-95 transition"
          >
            + Coffee
          </button>
        </div>
        <div className="bg-white shadow p-4 rounded-lg w-40">
          <p className="text-lg font-medium mb-2">🚬 Cigarettes: {cigCount}</p>
          <button
            onClick={() => setCigCount((prev) => prev + 1)}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded w-full active:scale-95 transition"
          >
            + Cigarette
          </button>
        </div>
      </div>

      <button
        onClick={updateCounters}
        className="px-4 py-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded active:scale-95 transition"
      >
        Save Data
      </button>

      <h3 className="text-2xl font-semibold mt-10 mb-4">🏆 Rankings</h3>
      <ul className="max-w-md mx-auto bg-white border rounded p-4 shadow space-y-2">
        {ranking.map((user, idx) => (
          <li key={idx} className="flex justify-between text-zinc-700">
            <span>
              {idx + 1}. {user.username}
            </span>
            <span>🚬 {user.cigCount} | ☕ {user.coffeeCount}</span>
          </li>
        ))}
      </ul>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
