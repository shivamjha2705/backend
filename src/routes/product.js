const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all Products
router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM product');
      return res.status(200).json({data:rows});
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Get a specific product by ID
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM product WHERE product_id = ?', [req.params.id]);
      if (rows.length > 0) {
        return res.status(200).json({data:rows[0]});

      } else {
        res.status(404).json({ message: 'product not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Create a new product
  router.post('/', async (req, res) => {
    const { product_name, category, product_description, sku, cost_price_per_unit } = req.body;
    try {
      const [result] = await pool.query('INSERT INTO product (product_name, category, product_description, sku, cost_price_per_unit) VALUES (?, ?, ?, ?, ?)', [product_name, category, product_description, sku, cost_price_per_unit]);
      return res.status(200).json({data:{ product_id: result.insertId }});

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Update an product
router.put('/:id', async (req, res) => {
    const { product_name, category, product_description, sku, cost_price_per_unit } = req.body;
    const productId = req.params.id;
    try {
      // Ensure the SQL query includes a placeholder for `product_id`
      const [result] = await pool.query(
        'UPDATE product SET product_name = ?, category = ?, product_description = ?, sku = ?, cost_price_per_unit = ? WHERE product_id = ?',
        [product_name, category, product_description, sku, cost_price_per_unit, productId]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({data:{ message: 'product updated successfully' }});
      } else {
        res.status(404).json({ message: 'product not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  // Delete a product
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM product WHERE product_id = ?', [req.params.id]);
      if (result.affectedRows > 0) {
        res.status(200).json({data:{ message: 'product deleted successfully' }});
      } else {
        res.status(404).json({ message: 'product not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


module.exports = router;