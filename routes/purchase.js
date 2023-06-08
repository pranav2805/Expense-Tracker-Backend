const express = require('express');

const router = express.Router();

const purchaseController = require('../controllers/purchaseCont');
const userAuthentication = require('../middleware/auth');

router.get('/premiumMembership', userAuthentication.authenticate, purchaseController.purchasePremium);

router.post('/updateTransactionStatus', userAuthentication.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;