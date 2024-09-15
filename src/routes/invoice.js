const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
    const { customer_name, phone_no, address, place, party_gstin_uin, invoice_date, mode_of_transportation, vihecle_no, cgst, sgst, igst, products } = req.body;

    let connection;
    try {
        // Start a transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Insert into invoice table
        const [invoiceResult] = await connection.query(
            `INSERT INTO invoice (customer_name, phone_no, address, place, party_gstin_uin, invoice_date, mode_of_transportation, vihecle_no, total_amount, cgst, sgst, igst, grand_total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL)`,
            [customer_name, phone_no, address, place, party_gstin_uin, invoice_date, mode_of_transportation, vihecle_no, cgst, sgst, igst]
        );

        const invoiceId = invoiceResult.insertId;
        let totalAmount = 0;

        // Insert each product into invoice_product table
        for (let product of products) {
            const { product_id, product_quantity, discount, cash_discount } = product;

            // Get product_name and rate (cost_price_per_unit) from product table
            const [productResult] = await connection.query(
                'SELECT product_name, cost_price_per_unit FROM product WHERE product_id = ?',
                [product_id]
            );

            if (productResult.length === 0) {
                throw new Error('Product not found');
            }

            const { product_name, cost_price_per_unit: rate } = productResult[0];

            // Calculate the amount
            const discountAmount = (rate * (discount / 100));
            const amount = (rate - discountAmount - cash_discount) * product_quantity;

            // Insert into invoice_product table
            await connection.query(
                `INSERT INTO invoice_product (product_id, product_name, hsn_sac_code, product_quantity, rate, discount, cash_discount, amount, invoice_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [product_id, product_name, product.hsn_sac_code, product_quantity, rate, discount, cash_discount, amount, invoiceId]
            );

            totalAmount += amount;
        }

        // Calculate grand_total
        const grandTotal = totalAmount + ((cgst / 100) * totalAmount) + ((sgst / 100) * totalAmount) + ((igst / 100) * totalAmount);

        // Update the invoice table with total_amount and grand_total
        await connection.query(
            'UPDATE invoice SET total_amount = ?, grand_total = ? WHERE invoice_id = ?',
            [totalAmount, grandTotal, invoiceId]
        );

        // Commit the transaction
        await connection.commit();
        res.status(200).json({data:{ message: 'Invoice created successfully', invoice_id: invoiceId }});

    } catch (err) {
        // Rollback the transaction in case of error
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// Get all invoices with their products
router.get('/', async (req, res) => {
    try {
        const [invoices] = await pool.query('SELECT * FROM invoice');

        // For each invoice, get related products
        for (let invoice of invoices) {
            const [products] = await pool.query(
                'SELECT * FROM invoice_product WHERE invoice_id = ?',
                [invoice.invoice_id]
            );
            invoice.products = products;
        }

        res.status(200).json({data:invoices});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific invoice by ID with its products
router.get('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    try {
        const [invoiceResult] = await pool.query(
            'SELECT * FROM invoice WHERE invoice_id = ?',
            [invoiceId]
        );

        if (invoiceResult.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = invoiceResult[0];

        const [products] = await pool.query(
            'SELECT * FROM invoice_product WHERE invoice_id = ?',
            [invoiceId]
        );

        invoice.products = products;
        res.status(200).json({data:invoice});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an invoice and its products
router.put('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    const { customer_name, phone_no, address, place, party_gstin_uin, invoice_date, mode_of_transportation, vihecle_no, cgst, sgst, igst, products } = req.body;

    let connection;
    try {
        // Start a transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update the invoice table
        await connection.query(
            `UPDATE invoice SET customer_name = ?, phone_no = ?, address = ?, place = ?, party_gstin_uin = ?, invoice_date = ?, mode_of_transportation = ?, vihecle_no = ?, cgst = ?, sgst = ?, igst = ? WHERE invoice_id = ?`,
            [customer_name, phone_no, address, place, party_gstin_uin, invoice_date, mode_of_transportation, vihecle_no, cgst, sgst, igst, invoiceId]
        );

        // Delete existing invoice products related to this invoice
        await connection.query('DELETE FROM invoice_product WHERE invoice_id = ?', [invoiceId]);

        let totalAmount = 0;

        // Insert updated products
        for (let product of products) {
            const { product_id, product_quantity, discount, cash_discount } = product;

            // Get product_name and rate (cost_price_per_unit) from product table
            const [productResult] = await connection.query(
                'SELECT product_name, cost_price_per_unit FROM product WHERE product_id = ?',
                [product_id]
            );

            if (productResult.length === 0) {
                throw new Error('Product not found');
            }

            const { product_name, cost_price_per_unit: rate } = productResult[0];

            // Calculate the amount
            const discountAmount = (rate * (discount / 100));
            const amount = (rate - discountAmount - cash_discount) * product_quantity;

            // Insert into invoice_product table
            await connection.query(
                `INSERT INTO invoice_product (product_id, product_name, hsn_sac_code, product_quantity, rate, discount, cash_discount, amount, invoice_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [product_id, product_name, product.hsn_sac_code, product_quantity, rate, discount, cash_discount, amount, invoiceId]
            );

            totalAmount += amount;
        }

        // Calculate grand_total
        const grandTotal = totalAmount + ((cgst / 100) * totalAmount) + ((sgst / 100) * totalAmount) + ((igst / 100) * totalAmount);

        // Update the invoice table with total_amount and grand_total
        await connection.query(
            'UPDATE invoice SET total_amount = ?, grand_total = ? WHERE invoice_id = ?',
            [totalAmount, grandTotal, invoiceId]
        );

        // Commit the transaction
        await connection.commit();
        res.status(200).json({data:{ message: 'Invoice updated successfully' }});

    } catch (err) {
        // Rollback the transaction in case of error
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// Delete an invoice and its products
router.delete('/:id', async (req, res) => {
    const invoiceId = req.params.id;

    let connection;
    try {
        // Start a transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Delete from invoice_product table
        await connection.query('DELETE FROM invoice_product WHERE invoice_id = ?', [invoiceId]);

        // Delete from invoice table
        const [result] = await connection.query('DELETE FROM invoice WHERE invoice_id = ?', [invoiceId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Commit the transaction
        await connection.commit();
        res.status(200).json({data:{ message: 'Invoice deleted successfully' }});

    } catch (err) {
        // Rollback the transaction in case of error
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;