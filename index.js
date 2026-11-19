const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.urlencoded({ extended: true })); // Parse form data

// Cloud Run connects to Postgres via a Unix socket securely under the hood
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (process.env.INSTANCE_CONNECTION_NAME) {
  dbConfig.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

const pool = new Pool(dbConfig);

// Show the registration form
app.get('/', (req, res) => {
  res.send(`
    <h2 style="font-family: sans-serif;">Register Product</h2>
    <form method="POST" action="/register" style="display: flex; flex-direction: column; width: 300px; gap: 10px;">
      <input type="text" name="name" placeholder="Product Name" required />
      <input type="text" name="serial" placeholder="Serial Number" required />
      <input type="email" name="email" placeholder="Your Email" required />
      <button type="submit">Register</button>
    </form>
  `);
});

// Handle form submission
app.post('/register', async (req, res) => {
  const { name, serial, email } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (name, serial_number, email) VALUES ($1, $2, $3)',
      [name, serial, email]
    );
    res.send('Success! <a href="/">Go back</a>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));