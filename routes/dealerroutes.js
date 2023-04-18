const express = require('express')
const router = express.Router();
const dealerlogin = require('../controller/dealer');


router.get('/dealer',(req,res)=>{
    res.render('dealer')
})

router.get('/exit',(req,res)=>{
    res.render('login')
})

router.post('/dealerlogin',dealerlogin.dealerlogin)

router.get('/plan',(req,res)=>{
    res.render('dealerHome',{plan:true})
})

router.get('/busdetails',(req,res)=>{
    res.render('dealerHome',{busdetails:true})
})

router.get('/dealerprofile',(req,res)=>{
    res.render('dealerHome',{dealerprofile:true});
})

module.exports =router;
