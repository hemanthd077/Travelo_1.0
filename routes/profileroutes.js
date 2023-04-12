const express = require('express')
const router = express.Router();
const Storage = require("../controller/profile")
const multer  = require('multer')
const upload = multer({storage:Storage}).single('profileimage')
const uploaddb = require('../src/uploaddb')
const Login = require('../controller/login');
const fs = require('fs');

const detailsArray = Login.mail();

router.get('/profile',async(req,res)=>{
    
    await uploaddb.findOne({userid:detailsArray[2]}).then(async(data)=>{
        console.log(data.profileimage.data);
        res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],data,value:data.profileimage.data.toString('base64'),'control':true})
    }).catch(err=>{
        console.log('image not inserted yet...:'+err)
        res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'control':true})
    })
})

router.get('/exit',(req,res)=>{
    res.render('login')
})

router.post('/photouploads',async(req, res)=>{
    upload(req,res,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            const newImage = new uploaddb({
                userid:detailsArray[2],
                profileimage:{
                    data:fs.readFileSync('uploads/'+req.file.filename),
                    ContentType:'image/png'
                }
            })
            newImage.save().then(()=>console.log('successfully uploaded')).catch(err=>console.log(err))
        }
    })
    
    return res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'control':true})
})

module.exports =router;
