const plandetails = require('../src/planDetails')
const busdetails = require('../src/busDetails')
const dealerdetails = require('../src/dealerdb');
const busbookingstatus = require('../src/busBookingStatusdb')

function casedetective(a){
    let capFirstLetter = a[0].toUpperCase();
    let restOfGreeting = a.slice(1).toLowerCase();
    return newGreeting = capFirstLetter + restOfGreeting; 
}

let busnamearr = [];
let buscontent = [];
let date;
const getin = async(req,res)=>{
    let destination = req.body.destination.toLowerCase();
    const data = await plandetails.find({city:destination})
    let source_destination = [];
    source_destination[0] = req.body.source;
    source_destination[1]= req.body.destination;
    source_destination[2]=req.body.date;
    date=req.body.date;
    source_destination[3] = casedetective(req.body.source);
    source_destination[4] = casedetective(req.body.destination);

    buscontent = [];
    if(data.length>0){
        
        for (let ind = 0; ind < data.length; ind++) {
            const busdata = await busdetails.find({busname:data[ind].busname});
            let temp = [];
            const dealer = await dealerdetails.findOne({dealerid:busdata[0].dealerid});
            if(busdata.length>0) {
                temp[0] = dealer.profileimage.ContentType+";base64,"+dealer.profileimage.data.toString('base64');
                temp[1] = data[ind].busname.toUpperCase();
                temp[2] = casedetective(req.body.source);
                busnamearr[ind] = data[ind].busname;
                temp[3] = casedetective(req.body.destination);
                temp[4] = busdata[0].seatcount;
                temp[5] = busdata[0].busimage.ContentType+";base64,"+busdata[0].busimage.data.toString('base64');
                buscontent[ind]=temp;
                
            }
        }

        const state = buscontent.length===0;
        if(state)
            return res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true})
        let ts = Date.now();

        let date_time = new Date(ts);
        let date = (date_time.getDate()+"").padStart(2,"0");
        let month = (date_time.getMonth() + 1+"").padStart(2, "0");
        let year = (date_time.getFullYear()+"").padStart(4,"0");
        const currentdate = year+"-"+month+"-"+date 

        console.log('date:'+currentdate);
        console.log('userdate:'+req.body.date);
        const datearr = (req.body.date).split("-"); 

        if(datearr[0] > year &&  datearr[2] > date){
            res.render('home',{result:true,buscontent,'city':data.city,'currentdate':currentdate,searchresult:true,source_destination})
        }
        else if(year==year){
            if(datearr[1]>month || (datearr[1]==month && datearr[2]>date)){
                res.render('home',{result:true,buscontent,'city':data.city,currentdate,searchresult:true,source_destination})
            }
            else{
                res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true,source_destination})
            }
        }
        else{
            res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true,source_destination})
        }
    }
    else{
        res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true,source_destination})
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