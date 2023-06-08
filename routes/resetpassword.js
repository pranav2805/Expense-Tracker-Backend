const express = require('express');

const router = express.Router();

const resetPasswordController = require('../controllers/resetPassword');

router.get('/updatepassword/:resetpasswordid', resetPasswordController.updatePassword)

router.get('/resetpassword/:id', resetPasswordController.resetPassword);

router.post('/forgotPassword', resetPasswordController.postSendEmail);

module.exports = router;