const busdetails = require('../src/busDetails')
const plandetails = require('../src/planDetails')
const Login = require('../controller/dealer');
const dealer = require('../src/dealerdb')
const fs = require('fs');
const multer  = require('multer');
const { log } = require('console');

let detailsArray = Login.dealermail();

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
            let str ="";
            for(let i=0;i<req.body.coverlocationcount;i++){
                str+=req.body["location_"+(i+1)];
                str+="-"
            }
            const newvalues = new plandetails({
                id:Date.now().toString(36),
                busname:req.body.busname,
                dealerid:detailsArray[0],
                state:req.body.state,
                noofdays:req.body.noofdays,
                price:req.body.amount,
                coverlocation:str,
                planfile:{
                    data:fs.readFileSync('uploads/plans/'+req.file.originalname),
                    ContentType:'file/pdf'
                },
            })
            let busname=[];
            await busdetails.distinct("busname",{dealerid:detailsArray[0]}).then(async(data)=>{
                for (let index = 0; index < data.length; index++) {
                    busname[index] = data[index];
                }
            })
            newvalues.save().then(()=>{
                console.log('successfully file uploaded ')
            }).catch(err=>{
                console.log(err)
                res.render('dealerHome',{disclimerfail:true,'res':'Upload Failed' , plan:true,busname})
            })
            
            res.render('dealerHome',{disclimer:true,'res':'Sucessfully uploaded' , plan:true,busname})
        }
    })

}

const busdetailsupload = (req,res)=>{
    upload1(req,res,async(err)=>{
        let files = req.files;
        if(err){
            res.render('dealerHome',{disclimerfail:true,'res':'Image Limit is 6' , busdetails:true})
        }
        else{
            let imageArray = files.map((file)=>{
                return img = file;

            })
            const data = await busdetails.find({busname:req.body.busname});
            if(data.length<6){
                imageArray.map((src,index)=>{
                    const newvalues = new busdetails({
                        id:Date.now().toString(36)+""+index,
                        busname:req.body.busname,
                        seatcount:req.body.seatcount,
                        dealerid:detailsArray[0],
                        musicsystem:req.body.soundsystem,
                        acornonac:req.body.acornonac,
                        seattype:req.body.seattype,
                        waterfilter:req.body.waterfilter,
                        lighting:req.body.lighting,
                        busimage:{
                            data:fs.readFileSync('uploads/busimages/'+src.filename),
                            ContentType:'image/png'
                        },
                    })

                    newvalues.save().then(()=>{
                        console.log('successfully uploaded '+(index+1)+' photo')
                    }).catch(err=>console.log(err))
                })
                if(req.body.flag==="1"){
                    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
                        dealername=data.dealername.toUpperCase();
                        let busimg = [];
                        await busdetails.find({busname:req.body.busname}).then(async(data1)=>{
                            for (let index = 0; index < data1.length; index++) {
                                busid[index] = data1[index].id;
                                busimg[index] = data1[index].busimage.ContentType+";base64,"+data1[index].busimage.data.toString('base64');   
                            }
                        })
                        res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname:req.body.busname,Busseat:req.body.seatcount,'busimage':true})
                    })
                }
                else{
                    res.render('dealerHome',{disclimer:true,'res':'Sucessfully uploaded' , busdetails:true})
                }
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
            res.redirect('/busdetail')
        }
    });
  }  
}

const profile = async(req,res)=>{
    
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true})
    }).catch(err=>{
        console.log('image not inserted yet...:'+err)
    })
}

const busdetail = async(req,res)=>{
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let busdetailArray=[];
        await busdetails.distinct("busname",{dealerid:detailsArray[0]}).then(async(detail)=>{
            for (let index = 0; index < detail.length; index++) {
                let temp = [];
                
                await busdetails.find({busname:detail[index]}).then(async(buscontent)=>{
                    await plandetails.findOne({busname:detail[index]}).then(async(value)=>{
                        if(value){
                            temp[8]=true;
                            temp[9]=false;
                        }
                        else{
                            temp[8] = false;
                            temp[9] = true;
                        }
                    })

                    temp[0] = buscontent[0].busname;
                    temp[1] = buscontent[0].seatcount+" Seats";
                    if(buscontent[0].seattype==="seater"){
                        temp[2] = "Seater";
                    }
                    else{
                        temp[2] = "Semi Sleeper";
                    }
                    if(buscontent[0].acornonac==="ac"){
                        temp[3] = "AC Bus";
                    }
                    else{
                        temp[3] = "Non Ac Bus";
                    }
                    if(buscontent[0].musicsystem==="yes"){
                        temp[4] = "Music System Installed";
                    }
                    else{
                        temp[4] = "No Music System";
                    }
                    if(buscontent[0].waterfilter==="yes"){
                        temp[5] = "Water Filter Installed";
                    }
                    else{
                        temp[5] = "No Water Filter";
                    }
                    if(buscontent[0].lighting==="yes"){
                        temp[6] = "Colour Lighting Installed";
                    }
                    else{
                        temp[6] = "No Colour Lighting";
                    }

                    temp[7] = buscontent[0].busimage.ContentType+";base64,"+buscontent[0].busimage.data.toString('base64');
                    busdetailArray[index]=temp;
                })
            }
        })
        if(busdetailArray.length===0){
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,busdetailArray})
        }
    }).catch(err=>{
        console.log('busdetail not found!!!!'+err)
    })
}



let planid =[];

const plandetail = async(req,res)=>{
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let planArray=[];
        planid=[];
        let coverlocation = [];
        await plandetails.find({dealerid:detailsArray[0]}).then(async(detail)=>{
            for (let index = 0; index < detail.length; index++) {
                let temp = [];
                coverlocation = [];
                let ind=0;
                temp[0] = detail[index].state.toUpperCase();
                temp[1] = detail[index].busname.toUpperCase();
                temp[2] = detail[index].noofdays;
                temp[3] = detail[index].price;
                let str = detail[index].coverlocation.split("-");
                for(let i=0;i<str.length-1;i++){
                    if(str[i]!="undefined")
                    coverlocation[ind++] = str[i];
                }
                //pdf data convert from bufferdata to dataURL
                const pdfData = detail[index].planfile.data.toString('base64');
                temp[4] = `data:application/pdf;base64,${pdfData.toString('base64')}`;
                temp[5] = coverlocation;
                planid[index]=detail[index].id;
                planArray[index] = temp; 
            }
        })
        if(planArray.length===0){
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,planArray,arrayplan:true})
        }
    }).catch(err=>{
        console.log('plan details not found!!!'+err)
    })
}

let busid =[];

const BusimageDetail = (async(req,res)=>{
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let Busname = req.body.busname;
        let Busseat;
        let busimg = [];
        busid =[];
        await busdetails.find({busname:req.body.busname}).then(async(data1)=>{
            Busseat = data1[0].seatcount;
            for (let index = 0; index < data1.length; index++) {
                busid[index] = data1[index].id;
                busimg[index] = data1[index].busimage.ContentType+";base64,"+data1[index].busimage.data.toString('base64');   
            }
        })
        res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname,Busseat,'busimage':true})
    }).catch(err=>{
        console.log('Bus Image details not found!!!'+err)
    })
})

const editBusInfo = (async(req,res)=>{
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        await busdetails.findOne({busname:req.body.busname}).then(async(data1)=>{
            seatCount=data1.seatcount;
            img=data1.busimage.ContentType+";base64,"+data1.busimage.data.toString('base64');
        })
        res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busname:req.body.busname,seatCount,editbusinfo:true,img})
    })
})



const updatebusinfo = (async(req,res)=>{
    const newvalues1 ={$set:{
        busname:req.body.busname,
        seatcount:req.body.seatcount,
        musicsystem:req.body.soundsystem,
        acornonac:req.body.acornonac,
        seattype:req.body.seattype,
        waterfilter:req.body.waterfilter,
        lighting:req.body.lighting,
    }};
    const filter1 = {busname : req.body.oldbusname}
    const options1 = { upsert: false };           
    await busdetails.updateMany(filter1,newvalues1,options1,(err , collection) => {
        if(err){
            console.log("Error Occurred while updating bus information in bus database: "+err);
            res.redirect('/busdetail')
        }
    })
    const newvalues2 ={$set:{
        busname:req.body.busname,
    }};
    const filter2 = {busname : req.body.oldbusname}
    const options2 = { upsert: false };  
    await plandetails.updateMany(filter2,newvalues2,options2,(err , collection) => {
        if(err){
            console.log("Error Occurred while updating bus information in plan database: "+err);
            res.redirect('/busdetail')
        }
    })
    console.log("Bus info updated successfully")
    res.redirect('/busdetail')
    
})

const busImageDelete = (async(req,res)=>{
    console.log("index:"+req.body.busidindex);
    try {
        let Busname;
        let Busseat;

        await busdetails.findOne({id:busid[req.body.busidindex]}).then(async(buscontent)=>{
            Busname = buscontent.busname;
            Busseat = buscontent.seatcount;
        })

        let result = await busdetails.deleteOne({ id: busid[req.body.busidindex]});
        console.log("Successfully Deleted the bus Image.");
        
        await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
            dealername=data.dealername.toUpperCase();
            let busimg = [];
            await busdetails.find({busname:Busname}).then(async(data1)=>{
                for (let index = 0; index < data1.length; index++) {
                    busid[index] = data1[index].id;
                    busimg[index] = data1[index].busimage.ContentType+";base64,"+data1[index].busimage.data.toString('base64');   
                }
            })
            res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname,Busseat,'busimage':true,dealerid:data.dealerid})
        }).catch(err=>{
            console.log('Bus Image details not found!!!'+err);
        })
    
    } catch (error) {
        console.log("Error while Deleteing the bus image: "+error);
    }
})

const busPlanDelete = (async(req,res)=>{
    try {
        let result = await plandetails.deleteOne({ id: planid[req.body.planindex]});
        console.log("Successfully Deleted the Selected Plan.");
        res.redirect('/plandetail');
    } catch (error) {
        console.log("Error while Deleteing the Plan: "+error);
    }
})

const busfullDeleteinfo = (async(req,res)=>{
    console.log(req.body.busname);
    const filter = {busname:req.body.busname};
    try {
        let result1 =  await busdetails.deleteMany(filter);
        console.log(result1.deletedCount + ' documents deleted in busdatabase');
        let result2 = await plandetails.deleteMany(filter);
        console.log(result2.deletedCount + ' documents deleted in plandatabase');
        console.log("Successfully Deleted the bus detail on plan and bus Database");
        res.redirect('/busdetail');
    } catch (error) {
        console.log("Error occur while deleting totaal businfo in plan and bus DB : "+error);
    }
    
})


module.exports = {
    plandetailsupload,
    busdetailsupload,
    dealerpic,
    profile,
    plandetail,
    busdetail,
    BusimageDetail,
    editBusInfo,
    updatebusinfo,
    busImageDelete,
    busPlanDelete,
    busfullDeleteinfo,
};