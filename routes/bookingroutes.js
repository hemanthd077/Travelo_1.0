const express = require('express');
const router = express.Router();
const userbooking = require('../controller/booking');

router.get('/booking',(req,res)=>{
    res.render('booking');
})

router.post('/payment/:planid',userbooking.prepayment);

router.post('/paymentstatus/:paymentid',userbooking.paymentstatus);



module.exports=router;


