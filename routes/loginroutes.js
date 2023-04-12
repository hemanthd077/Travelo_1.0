const express = require('express')
const router = express.Router();
const Login = require('../controller/login');


router.get('/',(req,res)=>{
    res.render('login')
})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.post('/login',Login.login)

module.exports =router;
