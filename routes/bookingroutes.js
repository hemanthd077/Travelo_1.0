const express = require('express');
const router = express.Router();
const userbooking = require('../controller/booking');



router.get('/booking',userbooking.bookingdata);

router.post('/payment/:planid',userbooking.prepayment);

router.post('/paymentstatus',userbooking.paymentstatus);

router.get('/generate-pdf/:orderid',userbooking.downloadpdf);

router.post('/ratingUpdate',userbooking.ratingUpdate);

module.exports=router;


