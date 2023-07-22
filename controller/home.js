const plandetails = require('../src/planDetails')
const busdetails = require('../src/busDetails')
const dealerdetails = require('../src/dealerdb');
const busbookingstatus = require('../src/busBookingStatusdb')

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


let busnamearr = [];
let buscontent = [];
let date;
const getin = async(req,res)=>{
    let destination = req.body.destination.toLowerCase();
    let source_destination = [];
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
    let destination_place = req.body.tocity.toLowerCase();
    console.log("City:"+sourceCity[0]);
    let bus_data_index=0;
    buscontent = [];
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
                                        temp[2] = casedetective(req.body.source);
                                        busnamearr[ind] = data[ind].busname;
                                        temp[3] = casedetective(req.body.destination);
                                        temp[4] = busdata.seatcount;
                                        if(busdata.busimage){
                                            temp[5] = busdata.busimage[0].ContentType+";base64,"+busdata.busimage[0].data.toString('base64');
                                        }
                                        buscontent[bus_data_index++]=temp;
                                    }
                                })     
                            }
                        }
                    }
                }
            })
        }
    })
    console.log("length : "+buscontent.length);
    if(buscontent.length===0){
        res.render('home',{'res':'No Buses Found',error:true,searchresult:true,source_destination})
    }
    else{
        res.render('home',{result:true,buscontent,'city':sourceCity[0],searchresult:true,source_destination})               
    }

}

const getImg = async(req,res)=>{
    let imagecontent = [];
    let totalDetail = [];
    totalDetail[1] = req.body.source;
    totalDetail[2] = req.body.destination;
    const data1 = await busdetails.find({busname:busnamearr[req.body.busid]})
    totalDetail[0] = data1[0].busname;
    totalDetail[3] = data1[0].seatcount;
    if(data1.length>0){
        for (let index = 0; index < data1.length; index++) {
            imagecontent[index] = data1[index].busimage.ContentType+";base64,"+data1[index].busimage.data.toString('base64');
        }
    } 
    res.render('home',{searchresult:true,image:true,imagecontent,totalDetail,date});
}

const getplan = async(req,res)=>{
    let planpdf;
    let totalDetail = [];
    totalDetail[1] = req.body.source;
    totalDetail[2] = req.body.destination;
    const data1 = await busdetails.find({busname:busnamearr[req.body.planid]})
    totalDetail[0] = data1[0].busname;
    totalDetail[3] = data1[0].seatcount;
    await plandetails.findOne({busname:busnamearr[req.body.planid]}).then(async(data2)=>{
        const pdfData = data2.planfile.data.toString('base64');
        planpdf = `data:application/pdf;base64,${pdfData.toString('base64')}`;
    })
    res.render('home',{detailplan:true,planpdf,totalDetail,searchresult:true,date});
}

module.exports = {
    getin,
    getImg,
    getplan,
}