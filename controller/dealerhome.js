const busdetails = require('../src/busDetails')
const plandetails = require('../src/planDetails')
const Login = require('../controller/dealer');
const fs = require('fs');
const dealermail = Login.dealermail();
const multer  = require('multer');


const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"uploads/busimages/");
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
})

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"uploads/plans/");
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
})

const upload1 = multer({storage:storage1}).array("busimage",6);

const upload2 = multer({storage:storage2}).single('planfile');



const plandetailsupload = async(req,res)=>{
    upload2(req,res,async(err)=>{
        if(err){
            console.log(err);
        }
        else{
            const newvalues = new plandetails({
                id:Date.now().toString(36),
                city:req.body.city,
                busname:req.body.busname,
                dealerid:dealermail[0],
                planfile:{
                    data:fs.readFileSync('uploads/plans/'+req.file.originalname),
                    ContentType:'file/pdf'
                },
            })
            newvalues.save().then(()=>{
                console.log('successfully file uploaded ')
            }).catch(err=>{
                console.log(err)
                res.render('dealerHome',{disclimerfail:true,'res':'Upload Failed' , plan:true})
            })
            res.render('dealerHome',{disclimer:true,'res':'Sucessfully uploaded' , plan:true})
        }
    })

}

const busdetailsupload = (req,res)=>{
    upload1(req,res,async(err)=>{
        let files = req.files;
        if(err){
            console.log(err);
        }
        else{
            let imageArray = files.map((file)=>{
                return img = file;

            })
            const data = await busdetails.findOne({busname:req.body.busname});
            if(!data){
                imageArray.map((src,index)=>{
                    const newvalues = new busdetails({
                        id:Date.now().toString(36)+""+index,
                        busname:req.body.busname,
                        seatcount:req.body.seatcount,
                        dealerid:dealermail[0],
                        busimage:{
                            data:fs.readFileSync('uploads/busimages/'+src.originalname),
                            ContentType:'image/png'
                        },
                    })

                    newvalues.save().then(()=>{
                        console.log('successfully uploaded '+(index+1)+' photo')
                    }).catch(err=>console.log(err))
                })
                res.render('dealerHome',{disclimer:true,'res':'Sucessfully uploaded' , busdetails:true})
            }
            else{
                res.render('dealerHome',{disclimerfail:true,'res':'Upload Failed' , busdetails:true})
        
            }
        }
    })
}

module.exports = {
    plandetailsupload,
    busdetailsupload
};