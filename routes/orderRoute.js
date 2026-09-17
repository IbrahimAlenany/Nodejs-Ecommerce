const express = require('express');
const { createCashOrder } = require('../services/orderServices');

const authServices = require('../services/authService');

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo('user'));

router.route('/:cartId').post(createCashOrder);

module.exports = router;
