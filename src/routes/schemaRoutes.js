const express = require('express');
const schemaController = require('../controllers/schemaController');

const router = express.Router();

// Import/Upload schema
router.post('/import', (req, res) => schemaController.importSchema(req, res));


// Get latest schema
router.get('/latest', (req, res) => schemaController.getLatestSchema(req, res));

// Get specific version
router.get('/version/:version', (req, res) =>
    schemaController.getSchemaByVersion(req, res)
);

// List all versions
router.get('/versions', (req, res) => schemaController.listVersions(req, res));

module.exports = router;