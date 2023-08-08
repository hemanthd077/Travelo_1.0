const plandetails = require('../src/planDetails')
const busdetails = require('../src/busDetails')
const dealerdetails = require('../src/dealerdb');
const busbookingstatus = require('../src/busBookingStatusdb');
const async = require('hbs/lib/async');
const Login = require('../controller/login');
const validation = require('../src/mongodb')


const detailsArray = Login.mail();

function casedetective(a){
    let capFirstLetter = a[0].toUpperCase();
    let restOfGreeting = a.slice(1).toLowerCase();
    return newGreeting = capFirstLetter + restOfGreeting; 
}

function isBusAvailable(start, end,booking) {
    if(!(booking)){
        return true;
    }

    const conflictingBooking = (start >= booking.startdate && start <= booking.endDate) ||(end >= booking.startdate && end <= booking.endDate) ||(start <= booking.startdate && end >= booking.endDate)
  
    return !conflictingBooking;
}


function calculateNextNthDate(startDate, n) {
  const currentDate = new Date(startDate);
  
  const currentDay = currentDate.getDate();
  
  currentDate.setDate(currentDay + n);
  
  return currentDate.toDateString();
}


let busidarr = [];
let buscontent = [];
let date;
let source_destination = [];
const getin = async(req,res)=>{
    let destination = req.body.destination.toLowerCase();
    source_destination = [];
    source_destination[0] = req.body.fromstate;
    source_destination[1]= req.body.fromdistrict;
    source_destination[2] = req.body.source;
    source_destination[3]= req.body.tostate;
    source_destination[4] = req.body.destination;
    source_destination[5] = req.body.tocity;
    source_destination[6]=req.body.date;
    date=req.body.date;
    source_destination[7] = casedetective(req.body.source);
    source_destination[8] = casedetective(req.body.destination);


    let sourceCity = req.body.fromdistrict.split(' ');
    sourceCity[0] = sourceCity[0].toLowerCase();
    let destination_place = req.body.tocity;
    console.log("City:"+sourceCity[0]);
    let bus_data_index=0;
    buscontent = [];
    busidarr = [];
    planidarr = [];
    let idIndex=0;
    let idIndex1=0;
    var varDate = new Date(req.body.date); 
    var today = new Date();
    if(today>=varDate){
        res.render('homeresult',{'res':'No Buses Found',error:true,searchresult:true,source_destination,'length':buscontent.length})
    }
    else{
        await dealerdetails.find({city:sourceCity[0]}).then(async(dealerdata)=>{
            for(let index=0;index<dealerdata.length;index++){
                await plandetails.find({dealerid:dealerdata[index].dealerid}).then(async(data)=>{
                    if(data){
                        for(let ind=0;ind<data.length;ind++){
                            console.log("id:"+data[ind].id);
                            let cover_location=[];
                            let str = data[ind].coverlocation.split('-');
                            let locatoion_index=0;
                            for(let i=0;i<str.length-1;i++){
                                if(str[i]!='')
                                    cover_location[locatoion_index++] = str[i];
                            }
                            
                            console.log("Destination:"+destination_place);
                            for(let i=0;i<cover_location.length;i++){
                                if( destination_place === cover_location[i]){
                                    await busdetails.findOne({id:data[ind].id}).then(async(busdata)=>{
                                        let busStatus = await busbookingstatus.findOne({busid:busdata.id});
                                        if(isBusAvailable(req.body.date,calculateNextNthDate(req.body.date,req.body.days),busStatus.bookings)){
                                            let temp = [];
                                            let dealerdata = await dealerdetails.findOne({dealerid:busdata.dealerid});
                                            temp[0] = dealerdata.profileimage.ContentType+";base64,"+dealerdata.profileimage.data.toString('base64');
                                            temp[1] = data[ind].busname.toUpperCase();
                                            temp[2] = dealerdata.dealername;
                                            
                                            temp[3] = cover_location;
                                            temp[4] = busdata.seatcount;
                                            if(busdata.musicsystem==='yes'){
                                                temp[5]=true;
                                            }
                                            else{
                                                temp[5]=false;
                                            }
                                            if(busdata.acornonac==='ac'){
                                                temp[6]=true;
                                            }
                                            else{
                                                temp[6]=false;
                                            }
                                            if(busdata.seattype==='seater'){
                                                temp[7]=true;
                                            }
                                            else{
                                                temp[7]=false;
                                            }
                                            if(busdata.lighting==='yes'){
                                                temp[8]=true;
                                            }
                                            else{
                                                temp[8]=false;
                                            }
                                            if(busdata.waterfilter==='yes'){
                                                temp[9]=true;
                                            }
                                            else{
                                                temp[9]=false;
                                            }
                                            let busAmount = Number(data[ind].price)+((Number(data[ind].price)*5)/100);
                                            temp[10]=busAmount;
                                            temp[11] = (busAmount*30)/100;
                                            if(busdata.busimage){
                                                temp[12] = busdata.busimage[0].ContentType+";base64,"+busdata.busimage[0].data.toString('base64');
                                            }
                                            temp[13]=Number(busdata.rating.currentrating);
                                            if(busdata.wifi==='yes'){
                                                temp[14]=true;
                                            }
                                            else{
                                                temp[14]=false;
                                            }
                                            if(busdata.lagguagestorage==='yes'){
                                                temp[15]=true;
                                            }
                                            else{
                                                temp[15]=false;
                                            }
                                            if(busdata.entertainsystem==='yes'){
                                                temp[16]=true;
                                            }
                                            else{
                                                temp[16]=false;
                                            }
                                            temp[17] = data[ind].noofdays;
                                            temp[18] = busdata.id;
                                            temp[19] = false;
                                            planidarr[idIndex++] = data[ind]._id;
                                            busidarr[idIndex1++] = busdata.id;
                                            const userdata = await validation.findOne({Email:detailsArray[2]}); 
                                            for(let i =0;i<userdata.likedbus.length;i++){
                                                if(userdata.likedbus[i].busid===temp[18]){
                                                    temp[19] = true;
                                                    break;
                                                }
                                            }
                                            buscontent[bus_data_index++]=temp;
                                        }
                                    })     
                                }
                            }
                        }
                    }
                    else{
                        res.render('homeresult',{'res':'No Buses Found',error:true,searchresult:true,source_destination,'length':buscontent.length})
                    }
                })
            }
        })
        console.log("length : "+buscontent.length);
        if(buscontent.length===0){
            res.render('homeresult',{'res':'No Buses Found',error:true,searchresult:true,source_destination,'length':buscontent.length})
        }
        else{
            res.render('homeresult',{result:true,buscontent,'city':sourceCity[0],searchresult:true,source_destination,'length':buscontent.length})               
        }
    
    }
}

const getBusData = async(req,res)=>{
    let imagecontent = [];
    planDataArray = []
    await plandetails.findOne({_id:planidarr[req.body.busid]}).then(async(detail)=>{
        if(detail){
            for(let i=0;i<detail.dayplans.length;i++){
                dummy = [];
                dummy[0] = detail.dayplans[i].day; 
                dummy[1] = detail.dayplans[i].content;
                dummy[3] = casedetective(detail.dayplans[i].mainspot);
                spotimages = [];
                for(let y =0;y<detail.dayplans[i].imageclips.length;y++){
                    spotimages[y] = detail.dayplans[i].imageclips[y].ContentType+";base64,"+detail.dayplans[i].imageclips[y].data.toString('base64');
                }
                dummy[2] = spotimages;
                planDataArray[i]=dummy
            }
        }
        //plan pdf code
        // const pdfData = data2.planfile.data.toString('base64');
        // planpdf = `data:application/pdf;base64,${pdfData.toString('base64')}`;
    }).catch(e=>{
        console.log("Error Occured while fetching plan in getBusData: "+e);
    })
    let busdata = buscontent[req.body.busid];
    await busdetails.findOne({id:busidarr[req.body.busid]}).then(async(data1)=>{
        if(data1){
            for (let index = 0; index < data1.busimage.length; index++) {
                imagecontent[index] = data1.busimage[index].ContentType+";base64,"+data1.busimage[index].data.toString('base64');
            }
            res.render('homeresult',{searchresult:true,busContent:true,imagecontent,headerdata:source_destination,busdata:buscontent[req.body.busid],planDataArray});
        }
        else{
            res.render('homeresult',{searchresult:true,busContent:true,source_destination,planDataArray});
        }
    }).catch(e=>{
        console.log("Error Occur while finding image at user singel bus detail fetching")
    })
}

const homepage = async(req,res)=>{
    validation.findOne({Email:detailsArray[2]}).then(async(user)=>{
        res.render('home',{content:true,data:user,value:user.profileimage.data.toString('base64')})
    }).catch((err)=>console.log('error in finding'+err))
}

const toggleheart = (async (req, res) => {
    const itemId = req.params.itemId;
    try {
      const item = await validation.findOne({Email:detailsArray[2]})
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      else{
        let flag=false;
        let tempid ='';
        for(let i=0;i<item.likedbus.length;i++){
            if(item.likedbus[i].busid===itemId){
                tempid = item.likedbus[i]._id;
                flag=true;
                break;
            }
        }

        if(flag){
            const filter = { Email : detailsArray[2] };
            const options2 = { upsert: false};  
            const update = {
                $pull: {
                    likedbus: { busid: itemId },
                },
            };
            const result = await validation.updateOne(filter, update,options2);
            if(result){
                console.log('Disliked the busid '+ itemId);
                res.json({ isLiked: "Unlike"});
            }
            else{
                console.log("Error while deleting busid in user Database");
            }
        }
        else{
            const newvalues ={$push:{
                likedbus:{
                    busid : itemId,
                },
            }};
            const filter2 = {Email : detailsArray[2]}
            const options2 = { upsert: false};  
            await validation.updateOne(filter2,newvalues,options2,(err , collection) => {
                if(err){
                    console.log("Error Occurred while updating busid for likes"+err);
                    res.redirect('/busdetail')
                }
            })
            res.json({ isLiked: "Like"});
        }
      }
    } catch (error) {
        console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


module.exports = {
    getin,
    getBusData,
    homepage,
    toggleheart,
}