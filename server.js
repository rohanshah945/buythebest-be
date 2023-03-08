const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(express.json({ limit: "10mb" })); // This is used for body-parser
app.use(cors()); // This is used to enable CORS

// Create Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "buythebest1",
});

// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql Connected...");
});

// Create DB
app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE buythebest";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send("Database Created...");
  });
});

// Create Table
app.get("/createtable", (req, res) => {
  let sql =
    "CREATE TABLE users(id INT AUTO_INCREMENT, name VARCHAR(255), email VARCHAR(255), password VARCHAR(255), address VARCHAR(255), postal_code VARCHAR(50), phone INT(10), PRIMARY KEY (id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    sql =
      "CREATE TABLE orders(id INT AUTO_INCREMENT, user INT, items LONGTEXT, address TEXT, postal_code VARCHAR(50), payment_mode VARCHAR(10),PRIMARY KEY (id))";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.send("Tables Created...");
    });
  });
});

// Register
app.post("/register", (req, res) => {
  const { name, email, password, address, phone } = req.body;

  const user = {
    name,
    email,
    password,
    address,
    phone,
  };

  let sql = "INSERT INTO users SET ?";
  try {
    db.query(sql, user, (err, result) => {
      if (err) {
        throw err;
      }
      return res.send({ user: { ...user, id: result.insertId } });
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

// Check Login
app.post("/auth", (req, res) => {
  const { email, password } = req.body;

  let sql = `SELECT * FROM users WHERE email = '${email}' AND  password = '${password}'`;

  try {
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      if (!result.length) {
        return res.status(400).json({
          errors: [{ message: "Either email or password is invalid" }],
        });
      }
      return res.send({ user: result[0] });
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Place Order
app.post("/placeOrder", (req, res) => {
  const { user_id, items, address, postal_code, payment_mode } = req.body;

  const entry = {
    user: user_id,
    address,
    postal_code,
    payment_mode,
    items: JSON.stringify(items),
  };

  let sql = "INSERT INTO orders SET ?";
  try {
    db.query(sql, entry, (err, result) => {
      if (err) {
        throw err;
      }
      res.send({ message: "Order placed successfully" });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update User
app.post("/users/:id", (req, res) => {
  const sql = "UPDATE `users` SET ? WHERE ?";

  try {
    db.query(sql, [req.body, req.params], (err, result) => {
      if (err) {
        throw err;
      }
      res.send({ message: "Details updated successfully" });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get All Orders by User id
app.get("/ordersByUser/:user_id", (req, res) => {
  const { user_id } = req.params;

  let sql = `SELECT * FROM orders WHERE user = '${user_id}'`;

  try {
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      res.send({
        orders: result.map((i) => ({ ...i, items: JSON.parse(i.items) })),
      });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Listen
app.listen(PORT, () => console.log(`Server is Running on port ${PORT}`));
