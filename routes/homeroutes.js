const express = require('express')
const router = express.Router();
const booking = require("../controller/home");
const { login } = require('../controller/login');

router.get('/home',booking.homepage)

router.get('/exit',(req,res)=>{
    res.redirect('/login')
})

router.post('/search',booking.getin)

router.post('/busimg',booking.getBusData)


module.exports =router;
