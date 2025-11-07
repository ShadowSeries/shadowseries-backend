const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// CORS beállítások
const corsOptions = {
  origin: "*", // vagy: "http://localhost:5500"
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // válaszol az OPTIONS preflight kérésre

app.use(express.json());

// Felhasználók fájl elérési útja
const USERS_FILE = path.join(__dirname, "data", "users.json");

// Regisztrációs végpont
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Minden mező kitöltése kötelező." });
  }

  let users = [];

  // Fájl beolvasása
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf8");
      users = JSON.parse(data);
    }
  } catch (err) {
    return res.status(500).json({ message: "Nem sikerült beolvasni a felhasználókat." });
  }

  // Ellenőrzés: email már létezik?
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "Ez az email már regisztrálva van." });
  }

  // Új felhasználó hozzáadása
  const newUser = { username, email, password };
  users.push(newUser);

  // Fájl mentése
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json({ message: "Sikeres regisztráció!" });
  } catch (err) {
    res.status(500).json({ message: "Nem sikerült menteni a felhasználót." });
  }
});

// Szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Szerver fut a ${PORT}-as porton`);
});
