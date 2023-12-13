const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 3002;
app.use(cors()); // Enable CORS for all routes
// Create a MySQL connection (replace with your MySQL connection details)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test_node', // Replace with your actual database name
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Middleware for parsing JSON
app.use(bodyParser.json());

// Function to encrypt the IC number
function encryptIc(ic) {
  const cipher = crypto.createCipher('aes-256-cbc', 'encryption_key');
  let encryptedIc = cipher.update(ic, 'utf-8', 'hex');
  encryptedIc += cipher.final('hex');
  return encryptedIc;
}

// API endpoint for creating a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username, fullname, ic, password } = req.body;

    // Encrypt the IC number before saving it to the database
    const encryptedIc = encryptIc(ic);

    // You should encrypt the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the MySQL database
    const insertQuery =
      'INSERT INTO user_management (username, fullname, ic, password) VALUES (?, ?, ?, ?)';
    const values = [username, fullname, encryptedIc, hashedPassword];

    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        console.log('User created successfully');
        res.status(201).json({ message: 'User created successfully' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
