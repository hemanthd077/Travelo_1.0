const express = require('express')
const router = express.Router();
const dealerlogin = require('../controller/dealerhome');

router.post('/plandetailsupload',dealerlogin.plandetailsupload);

router.post('/busdetailsupload',dealerlogin.busdetailsupload);

router.post('/dealerprofile',dealerlogin.dealerpic);

router.get('/dealerprofile',dealerlogin.profile)

router.get('/plandetail',dealerlogin.plandetail);

router.get('/busdetail',dealerlogin.busdetail);



module.exports=router;