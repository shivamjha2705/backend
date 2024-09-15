const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create a new stock entry
router.post('/', async (req, res) => {
    const { stock_quantity, stock_unit, customer_id, product_id } = req.body;

    try {
        // Fetch cost_price_per_unit from the product table
        const [productRows] = await pool.query('SELECT cost_price_per_unit FROM product WHERE product_id = ?', [product_id]);

        if (productRows.length > 0) {
            const cost_price_per_unit = productRows[0].cost_price_per_unit;
            const total_stock_price = cost_price_per_unit * stock_quantity;

            const [result] = await pool.query(
                'INSERT INTO stock (cost_price_per_unit, total_stock_price, stock_quantity, stock_unit, customer_id, product_id) VALUES (?, ?, ?, ?, ?, ?)',
                [cost_price_per_unit, total_stock_price, stock_quantity, stock_unit, customer_id, product_id]
            );

            res.status(200).json({data:{ stock_id: result.insertId, message: 'Stock added successfully' }});
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all stock entries
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stock');
        res.status(200).json({data:rows});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific stock entry by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stock WHERE stock_id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.satatus(200).json({data:rows[0]});
        } else {
            res.status(404).json({ message: 'Stock entry not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a stock entry
router.put('/:id', async (req, res) => {
    const { stock_quantity, stock_unit, customer_id, product_id } = req.body;
    const stockId = req.params.id;

    try {
        // Fetch cost_price_per_unit from the product table
        const [productRows] = await pool.query('SELECT cost_price_per_unit FROM product WHERE product_id = ?', [product_id]);

        if (productRows.length > 0) {
            const cost_price_per_unit = productRows[0].cost_price_per_unit;
            const total_stock_price = cost_price_per_unit * stock_quantity;

            const [result] = await pool.query(
                'UPDATE stock SET cost_price_per_unit = ?, total_stock_price = ?, stock_quantity = ?, stock_unit = ?, customer_id = ?, product_id = ? WHERE stock_id = ?',
                [cost_price_per_unit, total_stock_price, stock_quantity, stock_unit, customer_id, product_id, stockId]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({data:{ message: 'Stock updated successfully' }});
            } else {
                res.status(404).json({ message: 'Stock entry not found' });
            }
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a stock entry
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM stock WHERE stock_id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.status(200).json({data:{ message: 'Stock entry deleted successfully' }});
        } else {
            res.status(404).json({ message: 'Stock entry not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
