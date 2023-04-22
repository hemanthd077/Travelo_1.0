const express = require('express')
const router = express.Router();
const booking = require("../controller/home")

router.get('/home',(req,res)=>{
    res.render('home',{content:true})
})

router.get('/exit',(req,res)=>{
    res.render('login')
})

router.post('/search',booking.getin)

module.exports =router;
