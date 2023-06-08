const express = require('express');
const router = express.Router();

const premiumController = require('../controllers/premiumCont');

router.get('/showLeaderboard', premiumController.getLeaderboard);

module.exports = router;