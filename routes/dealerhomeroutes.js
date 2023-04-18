const express = require('express')
const router = express.Router();
const dealerlogin = require('../controller/dealerhome');

router.post('/busdetailsupload',dealerlogin.busdetailsupload);

module.exports=router;