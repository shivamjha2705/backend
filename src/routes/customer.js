const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customer');
    res.status(200).json({data:rows});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific customer by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customer WHERE customer_id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.status(200).json({data:rows[0]});
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone_no, address, city, state, zip_code, gstin, client_type, category } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO customer (first_name, last_name, email, phone_no, address, city, state, zip_code, gstin, client_type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, email, phone_no, address, city, state, zip_code, gstin, client_type, category]);
    res.status(200).json({data:{ customer_id: result.insertId }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone_no, address, city, state, zip_code, gstin, client_type, category } = req.body;
  try {
    const [result] = await pool.query('UPDATE customer SET first_name = ?, last_name = ?, email = ?, phone_no = ?, address = ?, city = ?, state = ?, zip_code = ?, gstin = ?, client_type = ?, category = ? WHERE customer_id = ?', [first_name, last_name, email, phone_no, address, city, state, zip_code, gstin, client_type, category, req.params.id]);
    if (result.affectedRows > 0) {
      res.status(200).json({data:{ message: 'Customer updated successfully'} });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM customer WHERE customer_id = ?', [req.params.id]);
    if (result.affectedRows > 0) {
      res.status(200).json({data:{ message: 'Customer deleted successfully' }});
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
