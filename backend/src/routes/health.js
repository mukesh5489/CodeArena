// Health check route
// Maps GET /api/health → healthController.getHealth

const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/healthController');

router.get('/', getHealth);

module.exports = router;
