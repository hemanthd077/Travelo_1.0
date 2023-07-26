const multer  = require('multer')
const fs = require('fs');
const Login = require('../controller/login');
const userdb = require('../src/mongodb');
const { log } = require('console');
const bcrypt = require('bcrypt')
let alert = require('alert'); 

function casedetective(a){
    let capFirstLetter = a[0].toUpperCase();
    let restOfGreeting = a.slice(1).toLowerCase();
    return newGreeting = capFirstLetter + restOfGreeting; 
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
})

const upload = multer({storage:storage}).single('profileimage')
const detailsArray = Login.mail();

const profileupload =async(req, res)=>{
  const data = await userdb.findOne({userid:detailsArray[2]});
      upload(req,res,async(err)=>{
          if(err){
              console.log(err);
          }
          else{
              const newvalues ={$set:{profileimage:{
                  data:fs.readFileSync('uploads/'+req.file.filename),
                  ContentType:'image/png',
              }}};
              const filter = {Email : detailsArray[2]}
              const options = { upsert: false };           
              await userdb.updateOne(filter,newvalues,options, (err , collection) => {
                  if(err){
                      console.log('error'+err)
                  }
              })
              console.log("profile photo updated successfully");
              res.redirect('/profile')
          }
      });
  }

const profile = async(req,res)=>{
    
    await userdb.findOne({Email:detailsArray[2]}).then(async(data)=>{
        detailsArray[0] = casedetective(data.fname);
        detailsArray[1] = casedetective(data.lname);
        res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'gender':data.gender,'phonenumber':data.phonenumber.number,'countrycode':data.phonenumber.countrycode,'address':data.address,data,value:data.profileimage.data.toString('base64'),'control':true,'personalinfo':true})
    }).catch(err=>{
      console.log('image not inserted yet...:'+err)
      res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'gender':data.gender,'phonenumber':data.phonenumber.number,'countrycode':data.phonenumber.countrycode,'address':data.address,'control':true,'personalinfo':true})
    })
}

const infoUpdate = async(req,res)=>{
    await userdb.findOne({Email:req.body.email}).then(async(data)=>{
        const newvalues ={$set:{
            fname:req.body.fname,
            lname:req.body.lname,
            address:req.body.address,
            phonenumber:{
                countrycode:req.body.countrycode,
                number:req.body.phonenumber,
            },
            gender:req.body.gender,
        }};
        const filter = {_id : data._id}
        const options = { upsert: false };           
        await userdb.updateOne(filter,newvalues,options,(err , collection) => {
            if(err){
                console.log('error'+err)
            }
        })
        console.log("info updated sucessfully");
        res.redirect('/profile')
    }).catch(err=>{
        console.log(err);
    })
}

module.exports = {
    profileupload,
    profile,
    infoUpdate,
  };