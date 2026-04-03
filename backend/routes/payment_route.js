const express = require('express');
const { createCharge } = require('../controller/payment_controller.js');

const router = express.Router();

router.post('/charge', createCharge);

module.exports = router;
