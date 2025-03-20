require("dotenv").config(); // This loads the .env file
console.log(process.env.MONGO_URI); // This will log the Mongo URI if it's loaded properly

// Import required modules
const express = require("express");
const mongoose = require("mongoose");

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if not provided

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define a Player model using MongoDB schema
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  receiver: { type: String, required: true },
});

const Player = mongoose.model("Player", playerSchema);

// Register a new player
app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  const allowedPlayers = ["Omar", "Abdullah", "Salman", "Mohammed", "Aroob"];

  // Ensure name is in the allowed list
  if (!allowedPlayers.includes(name)) {
    return res.status(400).json({ error: "اسم غير مسموح به!" });
  }

  try {
    // Check if player already registered
    const existingPlayer = await Player.findOne({ name });
    if (existingPlayer) {
      return res.status(400).json({ error: "تم التسجيل مسبقاً!" });
    }

    // Get registered players
    const players = await Player.find();

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
      availableReceivers[Math.floor(Math.random() * availableReceivers.length)];

    // Store in database
    const newPlayer = new Player({ name, email, receiver });
    await newPlayer.save();

    // Respond with success message
    res.json({
      message: `تم تسجيلك بنجاح! الشخص الذي ستهاديه هو: ${receiver}`,
    });
  } catch (err) {
    console.error("Error registering player:", err);
    res.status(500).json({ error: "حدث خطأ في التسجيل!" });
  }
});
app.use(express.static("public")); // 'public' folder where your static files are

// Start the server
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
