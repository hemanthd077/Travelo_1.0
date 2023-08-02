const busdetails = require('../src/busDetails')
const plandetails = require('../src/planDetails')
const Login = require('../controller/dealer')
const dealer = require('../src/dealerdb')
const busbookingstatus = require('../src/busBookingStatusdb')
const fs = require('fs');
const multer  = require('multer');
const { log } = require('console');
const async = require('hbs/lib/async')

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

const storage3 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"uploads/planimages/");
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
    fieldname:function (req, file, cb) {
        return cb(null,file.fieldname)
     },
})

const upload = multer({storage:storage}).single('profileimage')

const upload1 = multer({storage:storage1}).array("busimage",6);

let upload3 = multer({storage:storage3}).any()
// const upload2 = multer({storage:storage2}).single('planfile');





const plandetailsupload = async(req,res)=>{
    upload3(req,res,async(err)=>{
        if (err instanceof multer.MulterError) {
            console.log("Error in upload3 file not working: "+err);
        }
        else{
            let str ="";
            for(let i=0;i<req.body.coverlocationcount;i++){
                if(req.body["location_"+(i+1)]){
                    str+=req.body["location_"+(i+1)];
                    str+="-"
                }
            }

            let id_bus;
            await busdetails.find({dealerid:detailsArray[0]}).then((data)=>{
                if(data){
                    for(let i =0;i<data.length;i++){
                        if(data[i].busname===req.body.busname){
                            id_bus= data[i].id;
                        }
                    }
                }
            })

            const newvalues = new plandetails({
                planId:detailsArray[0]+""+Date.now(),
                id:id_bus,
                busname:req.body.busname,
                dealerid:detailsArray[0],
                state:req.body.state,
                noofdays:req.body.noofdays,
                price:req.body.amount,
                coverlocation:str,
                dayplans:[],
            })

            for(let i=1;i<=req.body.noofdays;i++){
                const newPlan = {
                    imageclips:[],
                    day:"Day "+i,
                    content:req.body["dayPlan_"+i],
                }
                let planimage = req.files.filter(file => file.fieldname === `locationimage_${i}`)
                let imageArray = planimage.map((file)=>{
                    return img = file;
                })
                imageArray.forEach((src) => {
                    const newImage = {
                    data: fs.readFileSync('uploads/planimages/' + src.filename),
                    ContentType: 'image/png'
                    }
                    newPlan.imageclips.push(newImage);
                });
                newvalues.dayplans.push(newPlan);
            }

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
            let busid_reference = Date.now().toString(36);
            if(data.length<6){
                const newvalues = new busdetails({
                    id:busid_reference,
                    busname: req.body.busname,
                    seatcount: req.body.seatcount,
                    dealerid: detailsArray[0],
                    musicsystem: req.body.soundsystem,
                    acornonac: req.body.acornonac,
                    seattype: req.body.seattype,
                    waterfilter: req.body.waterfilter,
                    lighting: req.body.lighting,
                    wifi:req.body.wifi,
                    lagguagestorage:req.body.lagguagestorage,
                    entertainsystem:req.body.entertainsystem,
                    rating:{
                        currentrating:"0",
                        count:"0",
                    },
                    busimage: [],
                })

                const busstatus = new busbookingstatus({
                    busid:busid_reference,
                })
                busstatus.save().then(()=>{
                    console.log('busstatus successfully uploaded ')
                }).catch(err=>console.log(err))

                imageArray.forEach((src) => {
                    const newImage = {
                      data: fs.readFileSync('uploads/busimages/' + src.filename),
                      ContentType: 'image/png'
                    }
                    newvalues.busimage.push(newImage);
                });
                newvalues.save().then(()=>{
                    console.log('successfully uploaded '+(imageArray.size)+' photo')
                }).catch(err=>console.log(err))
                if(req.body.flag==="1"){
                    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
                        dealername=data.dealername.toUpperCase();
                        let busimg = [];
                        await busdetails.find({busname:req.body.busname}).then(async(data1)=>{
                            for (let index = 0; index < data1.length; index++) {
                                busid[index] = data1[index].id;
                                busimg[index] = data1[index].busimage[0].ContentType+";base64,"+data1[index].busimage[0].data.toString('base64');   
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
                    if(!(buscontent[0].busimage.length===0)){
                        temp[7] = buscontent[0].busimage[0].ContentType+";base64,"+buscontent[0].busimage[0].data.toString('base64');
                    }
                    if(buscontent[0].wifi==="yes"){
                        temp[10] = "Wifi Connectivity Avaliable";
                    }
                    else{
                        temp[10] = "No Wifi Connectivity";
                    }
                    if(buscontent[0].lagguagestorage==="yes"){
                        temp[11] = "Laggage Storage Avaliable";
                    }
                    else{
                        temp[11] = "No Laggage Storage";
                    }
                    if(buscontent[0].entertainsystem==="yes"){
                        temp[12] = "Entertainment System Installed";
                    }
                    else{
                        temp[12] = "No Entertainment System";
                    }
                    busdetailArray[index]=temp;
                })
            }
        })
        if(busdetailArray.length===0){
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,busdetailArray,busarraylen:true,flag:false})
        }
    }).catch(err=>{
        console.log('busdetail not found!!!!'+err)
    })
}



let planid =[];

const plandetail = async(req,res)=>{
    let planArray=[];
    let coverlocation = [];
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        if(data){
            dealername=data.dealername.toUpperCase();
            planid=[];
            await plandetails.find({dealerid:detailsArray[0]}).then(async(detail)=>{
                if(detail){
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
                        
                        // //pdf data convert from bufferdata to dataURL
                        // const pdfData = detail[index].planfile.data.toString('base64');
                        // temp[4] = `data:application/pdf;base64,${pdfData.toString('base64')}`;
                        temp[5] = coverlocation;
                        planData = [];
                        spotImage = []
                        for(let i=0;i<detail[index].dayplans.length;i++){
                            dummy = [];
                            dummy[0] = detail[index].dayplans[i].day; 
                            dummy[1] = detail[index].dayplans[i].content;
                            imageStorage  = [];
                            for(let j =0;j<detail[index].dayplans[i].imageclips.length;j++){
                                imageStorage[j] = detail[index].dayplans[i].imageclips[j].ContentType+";base64,"+detail[index].dayplans[i].imageclips[j].data.toString('base64');
                            }
                            dummy[2]= imageStorage;
                            planData[i]=dummy
                        }
                        temp[4] = spotImage;  // null
                        temp[6] = planData; 
                        planid[index]=detail[index].id;
                        planArray[index] = temp;
                    } 
                }
            })
        }
        if(planArray.length===0){
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,planArray,arrayplan:true,busplanarraylen:true,flag:false})
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
        busid
        await busdetails.findOne({busname:req.body.busname}).then(async(data1)=>{
            Busseat = data1.seatcount;
            busid= data1.id;
            for (let index = 0; index < data1.busimage.length; index++) {
                temp = []
                temp[0]= data1.busimage[index].ContentType+";base64,"+data1.busimage[index].data.toString('base64');   
                temp[1] = Busname;
                busimg[index] = temp;
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
            img=data1.busimage[0].ContentType+";base64,"+data1.busimage[0].data.toString('base64');
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
    console.log("busname:"+req.body.picbusname);
    try {
        let Busname = req.body.picbusname;
        let Busseat;
        let imageid;

        
        await busdetails.findOne({busname:req.body.picbusname}).then(async(buscontent)=>{
            Busseat = buscontent.seatcount;
            busid = buscontent._id;
            imageid = buscontent.busimage[req.body.busidindex]._id;
        })

        const updateQuery = {
            $pull: {
              busimage: { _id: imageid } // Use the busId to match the document and remove the specific index
            }
          };

          busdetails.updateOne({ _id: busid }, updateQuery)
            .then(() => {
                console.log('Image deleted successfully');
            })
            .catch(err => {
                console.log('Error:', err);
            });

        // let result = await busdetails.deleteOne({ _id: imageid});
        // console.log("Successfully Deleted the bus Image.");
        
        await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
            dealername=data.dealername.toUpperCase();
            let busimg = [];
            busid=0;
            await busdetails.findOne({busname:Busname}).then(async(data1)=>{
                Busseat = data1.seatcount;
                busid= data1.id;
                for (let index = 0; index < data1.busimage.length; index++) {
                    temp = []
                    temp[0]= data1.busimage[index].ContentType+";base64,"+data1.busimage[index].data.toString('base64');   
                    temp[1] = Busname;
                    busimg[index] = temp;
                }
            })
            res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname,Busseat,'busimage':true})
        }).catch(err=>{
            console.log('Bus Image details not found!!!'+err)
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

const busbooked = (async(req,res)=>{
    res.render('dealerHome',{busbooking:true})
})


const addbusimage = (req,res)=>{
        // console.log(data);
        upload1(req,res,async(err)=>{
            let files = req.files
            // console.log("busname : "+req.body.busname);
            // console.log(files);
            if(err){
                res.render('dealerHome',{disclimerfail:true,'res':'Image Limit is 6' , busdetails:true})
            }
            else{
                let imageArray = files.map((file)=>{
                    return img = file;
                })
                buspicarray = [];
                imageArray.forEach((src,index) => {
                    
                    const newImage = {
                      data: fs.readFileSync('uploads/busimages/' + src.filename),
                      ContentType: 'image/png'
                    }
                    buspicarray[index]=newImage;
                })
                const details = await busdetails.findOne({busname:req.body.busname});
                if(details){
                    

                    const newvalues2 ={$push:{
                        busimage:buspicarray,
                    }};
                    const filter2 = {_id : details._id}
                    const options2 = { upsert: false};  
                    await busdetails.updateMany(filter2,newvalues2,options2,(err , collection) => {
                        if(err){
                            console.log("Error Occurred while updating bus information in plan database: "+err);
                            res.redirect('/busdetail')
                        }
                    })

                    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
                        dealername=data.dealername.toUpperCase();
                        let Busname=req.body.busname;
                        let Busseat;
                        let busimg = [];
                        busid
                        await busdetails.findOne({busname:req.body.busname}).then(async(data1)=>{
                            Busseat = data1.seatcount;
                            busid= data1.id;
                            for (let index = 0; index < data1.busimage.length; index++) {
                                temp = []
                                temp[0]= data1.busimage[index].ContentType+";base64,"+data1.busimage[index].data.toString('base64');   
                                temp[1] = Busname;
                                busimg[index] = temp;
                            }
                        })
                        res.render('dealerHome',{dealerprofile:true,dealername,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname,Busseat,'busimage':true})
                    }).catch(err=>{
                        console.log('Bus Image details not found!!!'+err)
                    })
                    
                }
                else{
                    console.log("Bus Details Not Found");
                }
            }
        })
    }

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
    busbooked,
    addbusimage,
};