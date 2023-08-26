const express = require('express')
const router = express.Router();
const Login = require('../controller/login');
const passport = require('passport'); 


function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401);
}

router.get('/',(req,res)=>{
    res.render('main');
})

router.get('/google',passport.authenticate('google' ,{scope:['profile','email']}));

router.get('/googlelogin',
    passport.authenticate('google',{
        successRedirect:'/newaccount',
        failureRedirect:'/efweh',
    })
)

router.get('/newaccount',isLoggedIn,Login.googleLogin)

router.get('/forgot-password',(req,res)=>{
    res.render('login',{fpassword:true})
})

router.get('/change-password',(req,res)=>{
    res.render('login',{cpassword:true})
})

router.get('/login',(req,res)=>{
    res.render('login',{login:true})
})

router.post('/login',Login.login)

router.post('/fpass-email',Login.fpass_nodemail)

router.post('/verify-code',Login.verify_code)

router.post('/update-password',Login.changePassword)

module.exports =router;
