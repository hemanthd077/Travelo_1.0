const express = require('express')
const router = express.Router();
const photouploads = require("../controller/profile")


router.get('/profile',photouploads.profile)

router.get('/exit',(req,res)=>{
    res.render('login')
})

router.post('/photouploads',photouploads.profileupload)
module.exports =router;
