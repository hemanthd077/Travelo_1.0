const busdetails = require('../src/busDetails')
const plandetails = require('../src/planDetails')
const Login = require('../controller/dealer');
const dealer = require('../src/dealerdb')
const fs = require('fs');
const dealermail = Login.dealermail();
const multer  = require('multer');
const dealerjs = require('../controller/dealer');
const { log } = require('console');

const detailsArray = dealerjs.dealermail();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
       return cb(null,file.originalname)
    },
})

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

const upload = multer({storage:storage}).single('profileimage')

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
                            data:fs.readFileSync('uploads/busimages/'+src.filename),
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

const dealerpic = async(req,res)=>{
  const data = await dealer.findOne({dealerid:detailsArray[0]});
  if(data){
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
            await dealer.updateOne(filter,newvalues,options, (err , collection) => {
                if(err){
                    console.log('error'+err)
                }
            })
            console.log("profile photo updated successfully");
            res.redirect('/dealerprofile')
        }
    });
  }  
}

const profile = async(req,res)=>{
    
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        res.render('dealerHome',{dealerprofile:true,dealername,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true})
    }).catch(err=>{
        console.log('image not inserted yet...:'+err)
    })
}

const busdetail = async(req,res)=>{
    
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let busdetailArray=[];
        let buspicArray = [];
        let buspictypeArray = [];
        await busdetails.distinct("busname",{dealerid:detailsArray[0]}).then(async(detail)=>{
            for (let index = 0; index < detail.length; index++) {
                let temp = [];
                await busdetails.findOne({busname:detail[index]}).then(async(buscontent)=>{
                    temp[0] = buscontent.busname;
                    temp[1] = buscontent.seatcount+" Seats";
                    temp[2]=  buscontent.busimage.ContentType+";base64,"+buscontent.busimage.data.toString('base64');
                    busdetailArray[index]=temp;
                })
            }
        })
        res.render('dealerHome',{dealerprofile:true,dealername,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,busdetailArray,buspicArray})
    }).catch(err=>{
        console.log('busdetail not found!!!!'+err)
    })
}


const plandetail = async(req,res)=>{
    
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let planArray=[];
        await plandetails.find({dealerid:detailsArray[0]}).then(async(detail)=>{
            for (let index = 0; index < detail.length; index++) {
                let temp = [];
                temp[0] = detail[index].city.toUpperCase();
                temp[1] = detail[index].busname.toUpperCase();

                //pdf data convert from bufferdata to dataURL
                const pdfData = detail[index].planfile.data.toString('base64');
                temp[2] = `data:application/pdf;base64,${pdfData.toString('base64')}`;

                planArray[index] = temp; 
            }
        })
        res.render('dealerHome',{dealerprofile:true,dealername,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,planArray})
    }).catch(err=>{
        console.log('plan details not found!!!'+err)
    })
}


module.exports = {
    plandetailsupload,
    busdetailsupload,
    dealerpic,
    profile,
    plandetail,
    busdetail
};