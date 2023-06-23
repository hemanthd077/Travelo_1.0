const express = require('express')
const router = express.Router();
const signupcontroller = require('../controller/signup');

router.get('/signup',(req,res)=>{
    res.render('signup')
})

router.post('/signup',signupcontroller.signup)

router.get('/verify',signupcontroller.verify);

router.get('/activation',(req,res)=>{
    res.render('activation');
});

module.exports =router;

