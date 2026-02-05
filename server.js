const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'occamy_hackathon_secret_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const db = new sqlite3.Database('./occamy.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    location TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    data TEXT,
    lat REAL,
    lng REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Seed Data (One-time)
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 8);
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', hash, 'admin']);
      
      const distHash = bcrypt.hashSync('dist123', 8);
      db.run("INSERT INTO users (username, password, role, location) VALUES (?, ?, ?, ?)", ['distributor1', distHash, 'distributor', 'Mumbai Zone A']);
      console.log("Seeded default users: admin/admin123, distributor1/dist123");
    }
  });
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token provided.');
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// --- API ROUTES ---

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: "Invalid Password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).json({ auth: true, token, role: user.role, username: user.username });
  });
});

// Get Dashboard Stats (Admin)
app.get('/api/stats', authenticate, (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const queries = {
    totalMeetings: `SELECT COUNT(*) as count FROM activities WHERE type='meeting'`,
    totalSales: `SELECT COUNT(*) as count FROM activities WHERE type='sale'`,
    totalSamples: `SELECT COUNT(*) as count FROM activities WHERE type='sample'`,
    totalUsers: `SELECT COUNT(*) as count FROM users WHERE role='distributor'`,
    recentActivities: `SELECT u.username, a.type, a.timestamp, a.lat, a.lng 
                       FROM activities a 
                       JOIN users u ON a.user_id = u.id 
                       ORDER BY a.timestamp DESC LIMIT 5`
  };

  let stats = {};
  let completed = 0;

  const checkComplete = () => {
    completed++;
    if (completed === Object.keys(queries).length) res.json(stats);
  };

  db.get(queries.totalMeetings, (err, row) => { stats.meetings = row.count; checkComplete(); });
  db.get(queries.totalSales, (err, row) => { stats.sales = row.count; checkComplete(); });
  db.get(queries.totalSamples, (err, row) => { stats.samples = row.count; checkComplete(); });
  db.get(queries.totalUsers, (err, row) => { stats.users = row.count; checkComplete(); });
  
  db.all(queries.recentActivities, (err, rows) => { 
    stats.recent = rows || []; 
    checkComplete(); 
  });
});

// Log Activity (Distributor)
app.post('/api/log', authenticate, (req, res) => {
  const { type, data, lat, lng } = req.body;
  
  db.run("INSERT INTO activities (user_id, type, data, lat, lng) VALUES (?, ?, ?, ?, ?)", 
    [req.userId, type, JSON.stringify(data), lat, lng], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Activity logged successfully", id: this.lastID });
    }
  );
});

// Get My Logs (Distributor)
app.get('/api/mylogs', authenticate, (req, res) => {
  db.all("SELECT * FROM activities WHERE user_id = ? ORDER BY timestamp DESC", [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({...r, data: JSON.parse(r.data)})));
  });
});

app.listen(PORT, () => {
  console.log(`Occamy Server running on port ${PORT}`);
});