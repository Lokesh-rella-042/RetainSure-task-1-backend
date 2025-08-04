const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

const db = new sqlite3.Database("users.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to users.db");
});

// Root
app.get("/", (req, res) => {
  res.send("User Management System");
});

// Get all users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Get user by ID
app.get("/user/:user_id", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.user_id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    row ? res.json(row) : res.status(404).send("User not found");
  });
});

// Create user
app.post("/users", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send("Invalid input");

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send("User created with ID " + this.lastID);
    }
  );
});

// Update user
app.put("/user/:user_id", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).send("Invalid data");

  db.run(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, req.params.user_id],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.send("User updated");
    }
  );
});

// Delete user
app.delete("/user/:user_id", (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.user_id], function (err) {
    if (err) return res.status(500).send(err.message);
    res.send(`User ${req.params.user_id} deleted`);
  });
});

// Search users by name
app.get("/search", (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send("Please provide a name to search");

  db.all("SELECT * FROM users WHERE name LIKE ?", [`%${name}%`], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing credentials");

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) return res.status(500).send(err.message);
      user
        ? res.json({ status: "success", user_id: user.id })
        : res.json({ status: "failed" });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
