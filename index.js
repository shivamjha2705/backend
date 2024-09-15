// const express = require('express');
// const app = express();

// app.use(express.json());

// // Import routes
// const customerRoutes = require('./src/routes/customer');
// const invoiceRoutes = require('./src/routes/invoice');
// const productRoutes = require('./src/routes/product');
// const stockRoutes = require('./src/routes/stock');
// const adminRoutes = require('./src/routes/admin');

// // Use routes
// app.use('/api/customers', customerRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/stocks', stockRoutes);
// app.use('/api/admins', adminRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require('express');
const cors = require('cors');  // Import the CORS middleware
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Import routes
const customerRoutes = require('./src/routes/customer');
const invoiceRoutes = require('./src/routes/invoice');
const productRoutes = require('./src/routes/product');
const stockRoutes = require('./src/routes/stock');
const adminRoutes = require('./src/routes/admin');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/admins', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
