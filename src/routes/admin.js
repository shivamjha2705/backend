const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/db');



router.post('/signup', async (req, res) => {
  const { first_name, last_name, username, email_id, login_password } = req.body;
  try {
      // Encrypt the password
      const hashedPassword = await bcrypt.hash(login_password, 10);

      const [result] = await pool.query(
          'INSERT INTO admin (first_name, last_name, username, email_id, login_password) VALUES (?, ?, ?, ?, ?)',
          [first_name, last_name, username, email_id, hashedPassword]
      );

      res.status(200).json({data:{ admin_id: result.insertId }});
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email_id, login_password } = req.body;
  try {
      const [rows] = await pool.query('SELECT * FROM admin WHERE email_id = ?', [email_id]);
      if (rows.length > 0) {
          const admin = rows[0];

          // Compare the provided password with the hashed password in the database
          const isMatch = await bcrypt.compare(login_password, admin.login_password);

          if (isMatch) {
              // Generate a JWT token
              const token = jwt.sign(
                  { admin_id: admin.admin_id, username: admin.username },
                  'your_secret_key', // Replace with your secret key
                  { expiresIn: '1h' }
              );

              res.status(200).json({data:{ token, message: 'Login successful' }});
          } else {
              res.status(401).json({ message: 'Invalid credentials' });
          }
      } else {
          res.status(404).json({ message: 'Admin not found' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});




// Get all Admins
router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM admin');
      res.status(200).json({data:rows});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a specific Admin by ID
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM admin WHERE admin_id = ?', [req.params.id]);
      if (rows.length > 0) {
        res.status(200).json({data:rows[0]});
      } else {
        res.status(404).json({ message: 'Admin not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Create a new admin
  router.post('/', async (req, res) => {
    const { first_name, last_name, username, email_id, login_password } = req.body;
    try {
      const [result] = await pool.query('INSERT INTO admin (first_name, last_name, username, email_id, login_password) VALUES (?, ?, ?, ?, ?)', [first_name, last_name, username, email_id, login_password]);
      res.status(200).json({data:{ admin_id: result.insertId }});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update an admin
router.put('/:id', async (req, res) => {
    const { first_name, last_name, username, email_id, login_password } = req.body;
    const adminId = req.params.id;
    try {
      // Ensure the SQL query includes a placeholder for `admin_id`
      const [result] = await pool.query(
        'UPDATE admin SET first_name = ?, last_name = ?, username = ?, email_id = ?, login_password = ? WHERE admin_id = ?',
        [first_name, last_name, username, email_id, login_password, adminId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({data:{ message: 'Admin updated successfully' }});
      } else {
        res.status(404).json({ message: 'Admin not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  // Delete a admin
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM admin WHERE admin_id = ?', [req.params.id]);
      if (result.affectedRows > 0) {
        res.status(200).json({data:{ message: 'admin deleted successfully' }});
      } else {
        res.status(404).json({ message: 'admin not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



module.exports = router;