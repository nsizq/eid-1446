const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Serve frontend files

// Database setup
const db = new sqlite3.Database("./players.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Allowed players
const allowedPlayers = ["Omar", "Abdullah", "Salman", "Mohammed", "Aroob"];

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    email TEXT UNIQUE,
    receiver TEXT
)`);

// Register a new player
app.post("/register", (req, res) => {
  const { name } = req.body;

  // Ensure name is in the allowed list
  if (!allowedPlayers.includes(name)) {
    return res.status(400).json({ error: "اسم غير مسموح به!" });
  }

  // Check if player already registered
  db.get("SELECT * FROM players WHERE name = ?", [name], (err, row) => {
    if (row) return res.status(400).json({ error: "تم التسجيل مسبقاً!" });

    // Get registered players
    db.all("SELECT * FROM players", [], (err, players) => {
      if (err) return res.status(500).json({ error: err.message });

      // Find available receivers
      const assignedReceivers = players.map((p) => p.receiver);
      const availableReceivers = allowedPlayers.filter(
        (n) => !assignedReceivers.includes(n) && n !== name
      );

      if (availableReceivers.length === 0) {
        return res.status(400).json({ error: "تم توزيع جميع الأسماء!" });
      }

      // Assign a random receiver
      const receiver =
        availableReceivers[
          Math.floor(Math.random() * availableReceivers.length)
        ];

      // Store in database
      db.run(
        "INSERT INTO players (name, receiver) VALUES (?, ?)",
        [name, receiver],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // Respond with success and receiver
          res.json({
            message: `تم تسجيلك بنجاح! الشخص الذي ستهاديه هو: ${receiver}`,
          });
        }
      );
    });
  });
});

// Start the server
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
