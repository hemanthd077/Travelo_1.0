const uploaddb = require('../src/uploaddb')
const multer  = require('multer')
const fs = require('fs');
const Login = require('../controller/login');
const userdb = require('../src/mongodb');

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
      res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],data,value:data.profileimage.data.toString('base64'),'control':true})
  }).catch(err=>{
      console.log('image not inserted yet...:'+err)
      res.render('profile',{'fname':detailsArray[0],'lname':detailsArray[1],'email':detailsArray[2],'control':true})
  })
}

const infoUpdate = async(req,res)=>{
    console.log(req.body.email);
    await userdb.findOne({Email:req.body.email}).then(async(data)=>{
        console.log(req.body.email);
    }).catch(err=>{
        alert("errorrrr");
    })
}

module.exports = {
    profileupload,
    profile,
    infoUpdate,
  };