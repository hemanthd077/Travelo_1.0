const express = require('express')
const router = express.Router();
const userbooking = require('../controller/booking');

router.get('/booking',(req,res)=>{
    res.render('booking');
})


module.exports=router;


