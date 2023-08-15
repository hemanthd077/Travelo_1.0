const express = require('express');
const router = express.Router();
const userbooking = require('../controller/booking');

router.get('/booking',userbooking.bookingdata);

router.post('/payment/:planid',userbooking.prepayment);

router.post('/paymentstatus/:paymentid',userbooking.paymentstatus);


module.exports=router;


