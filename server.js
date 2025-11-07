const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// A users.json fájl elérési útja egy szinttel feljebb
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

// Regisztrációs végpont
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Minden mező kitöltése kötelező." });
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "Ez az email már regisztrálva van." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, email, password: hashedPassword });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: "Sikeres regisztráció!" });
});

// Bejelentkezési végpont
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Hibás email vagy jelszó." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Hibás email vagy jelszó." });
  }

  res.json({ message: "Sikeres bejelentkezés!", username: user.username });
});

// Szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Szerver fut a ${PORT}-as porton`);
});
