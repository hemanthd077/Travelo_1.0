const busdetails = require('../src/busDetails')
const plandetails = require('../src/planDetails')
const Login = require('../controller/dealer')
const dealer = require('../src/dealerdb')
const busbookingstatus = require('../src/busBookingStatusdb')
const fs = require('fs');
const multer  = require('multer');
const { log } = require('console');
const async = require('hbs/lib/async')
const nodemailer = require('nodemailer');
const paymentstatusdb = require('../src/paymentStatusdb')
const orderdatadb = require('../src/orderDatadb');
const dealerdetails = require('../src/dealerdb');
const userdb = require('../src/mongodb');
const puppeteer = require('puppeteer');
const moment = require('moment');


require('dotenv').config();
const TRANSPORT_USER = process.env.EMAILTRANSPORT_USER
const TRANSPORT_PASSWORD = process.env.EMAILTRANSPORT_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure:true,
    auth: {
        user: TRANSPORT_USER,
        pass: TRANSPORT_PASSWORD
    },
  });


function reverseData(Datestr){
    const inputDate = new Date(Datestr);
    const formattedDate = inputDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    return formattedDate;
}

function checkingDateStatus(startDate, endDate) {
    const currentDate = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (currentDate.isSame(start, 'day')) {
        return 'Starts Today';
    } else if (currentDate.isSame(end, 'day')) {
        return 'Ends Today';
    } else if (currentDate.isBetween(start, end, 'day', '[]')) {
        return 'Ongoing';
    } else if (currentDate.isBefore(start, 'day')) {
        const daysDiff = start.diff(currentDate, 'days');
        if(daysDiff===0){
            return 'Tomorrow'
        } else{
            return `Starts in ${daysDiff} days`;
        }
    } else {
        return 'Completed';
    }
}

function checkDateStatus(inputDate) {
    const currentDate = moment();
    const targetDate = moment(inputDate);
    
    if (targetDate.isBefore(currentDate, 'day')) {
        return true;
    } else {
        return false;
    }
}

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


function casedetective(a){
    let capFirstLetter = a[0].toUpperCase();
    let restOfGreeting = a.slice(1).toLowerCase();
    return newGreeting = capFirstLetter + restOfGreeting; 
}


const plandetailsupload = async(req,res)=>{
    upload3(req,res,async(err)=>{
        if (err instanceof multer.MulterError) {
            console.log("Error in upload3 file not working: "+err);
        }
        else{
            let str ="";
            for(let i=0;i<req.body.noofdays;i++){
                if(req.body["mainspot_"+(i+1)]){
                    str+=req.body["mainspot_"+(i+1)];
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
                    mainspot:req.body["mainspot_"+i],
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
            await busdetails.find({dealerid:detailsArray[0]}).then(async(data)=>{
                for (let index = 0; index < data.length; index++) {
                    busname[index] = data[index].busname;
                }
            })
            newvalues.save().then(()=>{
                console.log('successfully plan data uploaded ')
                res.render('dealerHome',{disclimer:true,'res':'Sucessfully uploaded' , plan:true,busname})
            }).catch(err=>{
                console.log("Error Occur in Uploading plan data : "+err)
                res.render('dealerHome',{disclimerfail:true,'res':'Upload Failed' , plan:true,busname})
            })
            

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
                        let contactno = data.phonenumber;
                        let busimg = [];
                        await busdetails.find({busname:req.body.busname}).then(async(data1)=>{
                            for (let index = 0; index < data1.length; index++) {
                                busid[index] = data1[index].id;
                                busimg[index] = data1[index].busimage[0].ContentType+";base64,"+data1[index].busimage[0].data.toString('base64');   
                            }
                        })
                        res.render('dealerHome',{dealerprofile:true,dealername,contactno,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busimg,Busname:req.body.busname,Busseat:req.body.seatcount,'busimage':true})
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
        let contactno = data.phonenumber;
        res.render('dealerHome',{dealerprofile:true,dealername,contactno,data,dealercity:data.city,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true})
    }).catch(err=>{
        console.log('image not inserted yet...:'+err)
    })
}

const busdetail = async(req,res)=>{
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        dealername=data.dealername.toUpperCase();
        let contactno = data.phonenumber;
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
            res.render('dealerHome',{dealerprofile:true,dealername,contactno,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,contactno,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],busdetail:true,busdetailArray,busarraylen:true,flag:false})
        }
    }).catch(err=>{
        console.log('busdetail not found!!!!'+err)
    })
}



let planid =[];

const plandetail = async(req,res)=>{
    let planArray=[];
    let coverlocation = [];
    let contactno="";
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        if(data){
            dealername=data.dealername.toUpperCase();
            planid=[];
            contactno=data.phonenumber;
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
                            dummy[3] = detail[index].dayplans[i].mainspot;
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
            res.render('dealerHome',{dealerprofile:true,dealername,contactno,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,flag:true})
        }
        else{
            res.render('dealerHome',{dealerprofile:true,dealername,contactno,dealercity:data.city,data,value:data.profileimage.data.toString('base64'),email:detailsArray[0],plandetail:true,planArray,'length':planArray.length,arrayplan:true,busplanarraylen:true,flag:false})
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
              busimage: { _id: imageid } 
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
        let result = await plandetails.deleteMany({ id: planid[req.body.planindex]});
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
    let upcomingTour = [];
    let upcomingTourIndex = 0;
    let completedTour = [];
    let completedTourIndex = 0;


    await paymentstatusdb.find({dealerid:detailsArray[0]}).then(async(paymentdata)=>{
        if(paymentdata){
            for(let paymentindex =0;paymentindex<paymentdata.length;paymentindex++){
                await orderdatadb.findOne({orderid:paymentdata[paymentindex].orderid}).then(async(orderdata)=>{
                    if(orderdata){
                        let buscontentdata = await busdetails.findOne({id:paymentdata[paymentindex].busid});
                        if(buscontentdata){
                            let temp = [];
                            const dealerdata = await dealerdetails.findOne({dealerid:paymentdata[paymentindex].dealerid})
                            temp[0] = dealerdata.profileimage.ContentType+";base64,"+dealerdata.profileimage.data.toString('base64');
                            temp[1] =  dealerdata.dealername;
                            temp[2] = buscontentdata.busname;
                            temp[3] = buscontentdata.busimage[0].ContentType+";base64,"+buscontentdata.busimage[0].data.toString('base64');
                            temp[4] = orderdata.orderid;
                            let cycle = paymentdata[paymentindex].dateAndTime.substring(paymentdata[paymentindex].dateAndTime.length-2,paymentdata[paymentindex].dateAndTime.length)
                            cycle = cycle.toUpperCase();
                            temp[5] = paymentdata[paymentindex].dateAndTime.substring(0,paymentdata[paymentindex].dateAndTime.length-2)+""+cycle;
                            temp[6] = reverseData(orderdata.fromdate);
                            temp[7] = reverseData(orderdata.todate);
                            temp[8] = orderdata.pickup;
                            const plandata = await plandetails.findOne({planId:paymentdata[paymentindex].planid});
                            let tempstr = plandata.coverlocation.substring(0, plandata.coverlocation.length-1);
                            let str = tempstr.split('-');
                            temp[9] = str;
                            temp[10] = paymentdata[paymentindex].amount;
                            temp[11] = paymentdata[paymentindex].balenceamount;
                            temp[12] = (paymentdata[paymentindex].status==="captured")?true:false;
                            temp[13] = checkingDateStatus(orderdata.fromdate,orderdata.todate);
                            temp[14] = Number(temp[10])+Number(temp[11]);
                            if(temp[12]){
                                if(checkDateStatus(orderdata.todate)){
                                    completedTour[completedTourIndex++] = temp;
                
                                }
                                else{
                                    upcomingTour[upcomingTourIndex++] = temp;
                                }
                            }
                        }
                    }
                })
            }
            console.log("UC "+upcomingTour.length)
            console.log("CD "+completedTour.length)
            upcomingTour.reverse();
            completedTour.reverse();
            if (upcomingTour.length === 0 && completedTour.length === 0) {
                res.render('dealerHome', { 'upcoming': true, 'completed': true, 'upcomingwarning': true, 'completedwarning': true ,busbooking:true});
            } else if (upcomingTour.length !== 0 && completedTour.length === 0) {
                res.render('dealerHome', { 'upcoming': true, 'completed': true, upcomingTour, 'completedwarning': true,busbooking:true });
            } else if (upcomingTour.length === 0 && completedTour.length !== 0) {
                res.render('dealerHome', { 'upcoming': true, 'completed': true, 'upcomingwarning': true, completedTour ,busbooking:true});
            } else {
                res.render('dealerHome', { 'upcoming': true, 'completed': true, upcomingTour, completedTour ,busbooking:true});
            }    
        }
    }).catch(e=>{
        console.log("Error While fetching paymentstatusdb data in dealerbookingdata : "+e)
        res.render('404');
    })
})


const addbusimage = (req,res)=>{
        upload1(req,res,async(err)=>{
            let files = req.files
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
let managerid = []

const manager =(async(req,res)=>{
    let managerarr = [];
    managerid = [];
    await dealer.findOne({dealerid:detailsArray[0]}).then(async(data)=>{
        if(data.manager.length){
            for (let index = 0; index < data.manager.length; index++) {
                let temp = [];
                temp[0] = casedetective(data.manager[index].mname);
                temp[1] = data.manager[index].mgender;
                temp[2] = data.manager[index].mcontactno;
                temp[3] = data.manager[index].memail;
                temp[4] = data.manager[index].mprofileimage.ContentType+";base64,"+data.manager[index].mprofileimage.data.toString('base64');
                temp[5] = data.dealername;
                managerarr[index] = temp;
                temp[6] = data._id;
                temp[7] = data.manager[index]._id;
                temp[8] = data.manager[index].mpassword
                temp[9] = data.dealerid;
                managerid[index] = temp;

            }
            res.render('dealerhome',{managerdetail:true,managerdata:true,managerarr})
        }
        else{
            res.render('dealerhome',{managerdetail:true,notfoundwarning:true})
        }
    })
})

const addManager = (async(req,res)=>{
    const newvalue = {
        mname:req.body.name,
        mgender:req.body.gender,
        mcontactno:req.body.contactno,
        memail:req.body.emailid,
        mpassword:req.body.password,
        mprofileimage:{
            data:fs.readFileSync('public/images/user.png'),
            ContentType:'image/png'
        },
    }
    const newvalues2 ={$push:{
        manager: newvalue,
    }};

    let dealername=""
    await dealer.findOne({dealerid:detailsArray[0]}).then(data=>{
        dealername = data.dealername;
    })

    const filter2 = {dealerid : detailsArray[0]}
    const options2 = { upsert: false};  
    await dealer.updateMany(filter2,newvalues2,options2,(err , collection) => {
        if(err){
            console.log("Error Occurred while updating Manager information in dealer database: "+err);
            res.redirect('/404')
        }
        else{
            console.log("Manager Added Successfully");
        }
    })
    const mailOptions = {
        from: 'traveloindia01@gmail.com',
        to: req.body.emailid,
        subject: 'Welcome to Travelo India',
        html:`<!DOCTYPE html> 
        <html> 
        <head> 
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                padding: 20px;
            } 
            .container {
                max-width: 500px;
                margin: 0 auto;
                background-color: #fff;
                padding: 30px;
                border-radius: 5px;
                border: 1px solid gainsboro;
                display: flex;
                align-items: center;
            } 
            .container-1 {
                max-width: 500px;
                margin: 0 auto;
                background-color: #fff;
                padding: 30px;
                border: none;
                display: flex;
                flex-direction:column;
                align-items: center;
            }  
            svg {
                margin-left: -30px;
                width: 560px;
                margin-top: 90px;
                position: absolute;
            } 
            h3 {
                z-index: 2;
                margin-top: -30px;
                text-align: center;
                color:#000000;
                position: relative;
            } 
            p {
                line-height: 1.5;
            } 
            .verification-code {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
            }
            button {
                width: 120px;
                height: 30px;
                color: white;
                background: #007bff;
                border-radius: 5px;
                border-style: none;
                cursor: pointer;
                font-size: 15px;
            }
            a{
                text-decoration: none;
                color:white;
            }
        
            button:hover{
                background-color: #0056b3;
                color:white;
                cursor:pointer;
            }
            .footer {
                text-align: center;
                color: #777;
                font-size: 14px;
                margin-top: 20px;
            } 
            </style> 
        </head>
        
        <body style="font-family:'Montserrat', sans-serif;">
            <div class="container">
                <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="background-image: url(https://lh3.googleusercontent.com/drive-viewer/AITFw-xDFqJWr-vKyyle-8NrIGubwPsc2z-zhM9hkGD_PHkAi7pbP5UIM6TciN3KblpIYZVrfS7jxKUfqDinz3yB3Z3JJV0AXw=s2560); background-repeat: no-repeat; background-position: center; width: 560px; height: 300px;margin-left:-30px;position:absolute; margin-top:-70px"></td> 
                    </tr>
                    <tr style="display: flex;align-items: center;">
                        <div class="container-1">
                            <div class="message">
                                <h3>Welcome to Travelo India, ${casedetective(req.body.name)}!</h3>
                                <p>A hearty welcome to our team at ${dealername}! We are truly excited to have you on board as the new Manager. Your wealth of experience promises to bring a new dimension to our company, and we eagerly anticipate reaching new milestones together.</p>
                                <p>Here are your manager credentials:</p>
                                <ul>
                                    <li><strong>Manager ID:</strong> ${req.body.emailid}</li>
                                    <li><strong>Manager Password:</strong> ${req.body.password}</li>
                                </ul>
                                <h3><button href="">Login Here</button></h3>
                                <p>Please keep these credentials confidential and ensure to change your password upon first login. If any questions arise, don't hesitate to reach out to <a href="mailto:${detailsArray[0]}">${detailsArray[0]}</a> or your Company.</p>
                                <p>Here's to a successful journey with us!</p>
                                <p>Best regards,<br>Travelo India</p>
                            </div>
                        </div>
                        <p style="text-align: center;color: #777;font-size: 11px;font-weight: 600;">Travelo India &#169; Copyrighted 2023 </p>
                    </tr>
                </table>
            </div>
        </body>
    </html>`,
        text: '' 
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.error('Error sending email:', error);
          res.redirect('/manager');
        } else {
          console.log('Email sent:', info.response);
          res.redirect('/manager');
        }
    });
})

const deletemanager = (async(req,res)=>{
    try{
        let dealerid = managerid[req.body.Managerindex][6];
        let checkid = managerid[req.body.Managerindex][7];

        const updateQuery = {
            $pull: {
                manager: { _id: checkid } 
            }
        };

        dealer.updateOne({_id:dealerid}, updateQuery)
        .then((data) => {
            console.log('Manager deleted successfully');
            res.redirect('/manager');
        })
        .catch(err => {
            console.log('Manager Deletion Error : ', err);
            res.render('/404');
        });
    }
    catch(e){
        res.render('/404');
    }

})

const requestmanagermail = (async(req,res)=>{
    let managertotaldata = [];
    managertotaldata[0] = managerid[req.body.Managerindex][7];

    const mailOptions = {
        from: 'traveloindia01@gmail.com',
        to: managerid[req.body.Managerindex][3],
        subject: 'Welcome to Travelo India',
        html:`<!DOCTYPE html> 
        <html> 
        <head> 
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                padding: 20px;
            } 
            .container {
                max-width: 500px;
                margin: 0 auto;
                background-color: #fff;
                padding: 30px;
                border-radius: 5px;
                border: 1px solid gainsboro;
                display: flex;
                align-items: center;
            } 
            .container-1 {
                max-width: 500px;
                margin: 0 auto;
                background-color: #fff;
                padding: 30px;
                border: none;
                display: flex;
                flex-direction:column;
                align-items: center;
            }  
            svg {
                margin-left: -30px;
                width: 560px;
                margin-top: 90px;
                position: absolute;
            } 
            h3 {
                z-index: 2;
                margin-top: -30px;
                text-align: center;
                color:#000000;
                position: relative;
            } 
            p {
                line-height: 1.5;
            } 
            .verification-code {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
            }
            button {
                width: 120px;
                height: 30px;
                color: white;
                background: #007bff;
                border-radius: 5px;
                border-style: none;
                cursor: pointer;
                font-size: 15px;
            }
            a{
                text-decoration: none;
                color:white;
            }
        
            button:hover{
                background-color: #0056b3;
                color:white;
                cursor:pointer;
            }
            .footer {
                text-align: center;
                color: #777;
                font-size: 14px;
                margin-top: 20px;
            } 
            </style> 
        </head>
        
        <body style="font-family:'Montserrat', sans-serif;">
            <div class="container">
                <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="background-image: url(https://lh3.googleusercontent.com/drive-viewer/AITFw-xDFqJWr-vKyyle-8NrIGubwPsc2z-zhM9hkGD_PHkAi7pbP5UIM6TciN3KblpIYZVrfS7jxKUfqDinz3yB3Z3JJV0AXw=s2560); background-repeat: no-repeat; background-position: center; width: 560px; height: 300px;margin-left:-30px;position:absolute; margin-top:-70px"></td> 
                    </tr>
                    <tr style="display: flex;align-items: center;">
                        <div class="container-1">
                            <div class="message">
                                <h3>Welcome to Travelo India, ${managerid[req.body.Managerindex][0]}!</h3>
                                <p>A hearty welcome to our team at ${managerid[req.body.Managerindex][5]}! We are truly excited to have you on board as the new Manager. Your wealth of experience promises to bring a new dimension to our company, and we eagerly anticipate reaching new milestones together.</p>
                                <p>Here are your manager credentials:</p>
                                <ul>
                                    <li><strong>Manager ID:</strong> ${managerid[req.body.Managerindex][3]}</li>
                                    <li><strong>Manager Password:</strong> ${managerid[req.body.Managerindex][8]}</li>
                                </ul>
                                <h3><button href="">Login Here</button></h3>
                                <p>Please keep these credentials confidential and ensure to change your password upon first login. If any questions arise, don't hesitate to reach out to <a href="mailto:${managerid[req.body.Managerindex][9]}">${managerid[req.body.Managerindex][9]}</a> or your Company.</p>
                                <p>Here's to a successful journey with us!</p>
                                <p>Best regards,<br>Travelo India</p>
                            </div>
                        </div>
                        <p style="text-align: center;color: #777;font-size: 11px;font-weight: 600;">Travelo India &#169; Copyrighted 2023 </p>
                    </tr>
                </table>
            </div>
        </body>
    </html>`,
        text: '' 
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.error('Error sending email:', error);
          res.redirect('/manager');
        } else {
          console.log('Email sent:', info.response);
          res.redirect('/manager');
        }
    });
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
    busbooked,
    addbusimage,
    manager,
    addManager,
    deletemanager,
    requestmanagermail,
};