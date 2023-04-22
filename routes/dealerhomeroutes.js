const express = require('express')
const router = express.Router();
const dealerlogin = require('../controller/dealerhome');

router.post('/plandetailsupload',dealerlogin.plandetailsupload);

router.post('/busdetailsupload',dealerlogin.busdetailsupload);


module.exports=router;