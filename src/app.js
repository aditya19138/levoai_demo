require('dotenv').config();
const express = require('express');
const schemaRoutes = require('./routes/schemaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/schemas', schemaRoutes);

// // Health check
// app.get('/health', (req, res) => {
//     res.json({ status: 'ok', message: 'Schema Versioning API is running' });
// });

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api/schemas`);
});

module.exports = app;