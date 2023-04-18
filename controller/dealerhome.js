const busdetails = require('../src/busDetails')
const Login = require('../controller/dealer');
const fs = require('fs');
const dealermail = Login.dealermail();
const multer  = require('multer');
const { json } = require('express');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = 'uploads/busimages/'
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
      cb(null,"uploads/busimages/");
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
})

const upload = multer({storage:storage}).array("busimage",6);


const plandetailsupload = async(req,res)=>{

}

const busdetailsupload = (req,res)=>{
    upload(req,res,(err)=>{
        let files = req.files;
        if(err){
            console.log(err);
        }
        else{
            let imageArray = files.map((file)=>{
                return img = fs.readFileSync('uploads/busimages/'+file.filename);

            })
            console.log('dealerid: '+dealermail[0]);
            imageArray.map((src,index)=>{
                    const newvalues = new busdetails({
                        dealerid:dealermail[0],
                        busname:req.body.busname,
                        seatcount:req.body.seatcount,
                        busimage:{
                            data:files[index].originalname,
                            ContentType:files[index].Mimetype
                        },
                    })
                    newvalues.save().then(()=>{
                        console.log('successfully uploaded one photo')
                    }).catch(err=>console.log(err))
            })
            res.redirect('/busdetails')
        }
    })
}

module.exports = {
    plandetailsupload,
    busdetailsupload
};