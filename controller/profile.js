const uploaddb = require('../src/uploaddb')
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
  const data = await uploaddb.findOne({userid:detailsArray[2]});
  if(!data){
      upload(req,res,(err)=>{
          if(err){
              console.log(err);
          }
          else{
              const newvalues = new uploaddb({
                  userid:detailsArray[2],
                  profileimage:{
                      data:fs.readFileSync('uploads/'+req.file.filename),
                      ContentType:'image/png'
                  },
              })
              newvalues.save().then(()=>{
                  console.log('successfully uploaded')
                  res.redirect('/profile')
              }).catch(err=>console.log(err))
          }
      })
  }
  else{
      upload(req,res,async(err)=>{
          if(err){
              console.log(err);
          }
          else{
              const newvalues ={$set:{profileimage:{
                  data:fs.readFileSync('uploads/'+req.file.filename),
                  ContentType:'image/png'
              }}};
              const filter = {_id : data._id}
              const options = { upsert: false };           
              await uploaddb.updateOne(filter,newvalues,options, (err , collection) => {
                  if(err){
                      console.log('error'+err)
                  }
              })
              console.log("profile photo updated successfully");
              res.redirect('/profile')
          }
      });
  }
}

const profile = async(req,res)=>{
    
    await uploaddb.findOne({userid:detailsArray[2]}).then(async(data)=>{
        await userdb.findOne({Email:data.userid}).then(async(data1)=>{
            detailsArray[0] = casedetective(data1.fname);
            detailsArray[1] = casedetective(data1.lname);
        }).catch(err=>{
            console.log(err);
            console.log("error in fetching userdb data");
        })
        res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],data,value:data.profileimage.data.toString('base64'),'control':true})
  }).catch(err=>{
      console.log('image not inserted yet...:'+err)
      res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'control':true})
  })
}

const infoUpdate = async(req,res)=>{
    await userdb.findOne({Email:req.body.email}).then(async(data)=>{
        const validpassword = await bcrypt.compare(req.body.password,data.password)
        if(validpassword){
            const newvalues ={$set:{fname:req.body.fname,lname:req.body.lname}};
            const filter = {_id : data._id}
            const options = { upsert: false };           
            await userdb.updateOne(filter,newvalues,options,(err , collection) => {
                if(err){
                    console.log('error'+err)
                }
            })
            console.log("info updated sucessfully");
            res.redirect('/profile')
        }
        else{
            console.log("wrong password");
            alert("wrong password")
        }
    }).catch(err=>{
        console.log(err);
    })
}

module.exports = {
    profileupload,
    profile,
    infoUpdate,
  };