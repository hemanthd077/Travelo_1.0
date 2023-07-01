const express = require('express')
const router = express.Router();
const Login = require('../controller/login');


router.get('/',(req,res)=>{
    res.render('main');
})

router.get('/forgot-password',(req,res)=>{
    res.render('login',{fpassword:true})
})

router.get('/login',(req,res)=>{
    res.render('login',{login:true})
})

router.post('/login',Login.login)

router.post('/fpass-email',Login.fpass_nodemail)

router.post('/verify-code',Login.verify_code)

router.post('/update-password',Login.changePassword)

module.exports =router;
