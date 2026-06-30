const express = require('express');
const router = express.Router();
const paintController = require('../controllers/paintController');

// Color routes -> /api/paints/colors
router.post('/colors', paintController.createColor);
router.get('/colors', paintController.getColors);
router.get('/colors/:id', paintController.getColorById);
router.put('/colors/:id', paintController.updateColor);
router.delete('/colors/:id', paintController.deleteColor);

// Order routes -> /api/paints/orders
router.post('/orders', paintController.createOrder);
router.get('/orders', paintController.getOrders);
router.get('/orders/:id', paintController.getOrderById);
router.put('/orders/:id', paintController.updateOrder);
router.delete('/orders/:id', paintController.deleteOrder);

module.exports = router;