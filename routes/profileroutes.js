const express = require('express')
const router = express.Router();
const Storage = require("../controller/profile")
const multer  = require('multer')
const upload = multer({storage:Storage}).single('profileimage')
const uploaddb = require('../src/uploaddb')

router.get('/profile',(req,res)=>{
    res.render('profile')
})

router.get('/exit',(req,res)=>{
    res.render('login')
})
router.post('/uploads',(req, res)=>{
    upload(req,res,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            const newImage = new uploaddb(({
                userid:req.body.emailid,
                profileimage:{
                    data:req.file.profileimage,
                    ContentType:'image/jpeg'
                }
            }))
            newImage.save().then(()=>console.log('successfully uploaded')).catch(err=>console.log(err))

        }
    })
    return res.render('profile');
})



module.exports =router;
