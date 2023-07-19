const express = require('express')
const router = express.Router();
const dealerlogin = require('../controller/dealer');

router.get('/dealer',(req,res)=>{
    res.render('dealer',{login:true})
})

router.get('/exit',(req,res)=>{
    res.render('login')
})

router.post('/dealerlogin',dealerlogin.dealerlogin)

router.get('/plan',dealerlogin.dealerbus)

router.get('/busdetails',(req,res)=>{
    res.render('dealerHome',{busdetails:true})
})

router.get('/dealer-forgetpassword',(req,res)=>{
    res.render('dealer',{fpassword:true})
})

router.post('/fpass-email-dealer',dealerlogin.fpass_nodemail)

router.post('/verify-code-dealer',dealerlogin.verify_code)

router.post('/update-password-dealer',dealerlogin.changePassword)





module.exports =router;
