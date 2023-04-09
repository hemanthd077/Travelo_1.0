const express = require('express')
const router = express.Router();
const login = require('../controller/login');


router.get('/',(req,res)=>{
    res.render('login')
})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.post('/login',login)

module.exports =router;
