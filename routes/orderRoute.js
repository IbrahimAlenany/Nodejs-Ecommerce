const express = require('express');
const { 
    createCashOrder,
    filterOrderForLoggedUser,
    findAllOrders,
    findSpecificOrder
} = require('../services/orderServices');

const authServices = require('../services/authService');

const router = express.Router();

router.use(authServices.protect);

router.route('/:cartId').post(authServices.allowedTo('user'), createCashOrder);
router.get('/',
    authServices.allowedTo('user','admin','manager'),
    filterOrderForLoggedUser,
    findAllOrders
);
router.get('/:id', findSpecificOrder)


module.exports = router;
