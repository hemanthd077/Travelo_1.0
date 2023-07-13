const express = require('express')
const router = express.Router();
const booking = require("../controller/home")

router.get('/home',(req,res)=>{
    res.render('home',{content:true})
})

router.get('/exit',(req,res)=>{
    res.redirect('/login')
})

router.post('/search',booking.getin)

router.post('/busimg',booking.getImg)

router.post('/busplan',booking.getplan)



module.exports =router;
