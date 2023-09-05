const async = require('hbs/lib/async');
const Login = require('../controller/login');
const home = require('../controller/home');
const Razorpay = require('razorpay');
const plandetails = require('../src/planDetails')
const paymentstatusdb = require('../src/paymentStatusdb')
const orderdatadb = require('../src/orderDatadb');
const busbookingstatus = require('../src/busBookingStatusdb');
const busdetails = require('../src/busDetails')
const dealerdetails = require('../src/dealerdb');
const userdb = require('../src/mongodb');
const puppeteer = require('puppeteer');
const moment = require('moment');

let userdata = Login.mail();
let searchdata = home.userSearchdata();

let tourplanarr = [];
require('dotenv').config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
let instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })

function checkDateStatus(inputDate) {
    const currentDate = moment();
    const targetDate = moment(inputDate);
    
    if (targetDate.isBefore(currentDate, 'day')) {
        return true;
    } else {
        return false;
    }
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

function reverseData(Datestr){
    const inputDate = new Date(Datestr);
    const formattedDate = inputDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    return formattedDate;
}

function calculateNextDate(startDateStr, n) {
    const startDate = new Date(startDateStr);
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + n);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    return nextDateStr;
}

let orderID="";
let amount;
const prepayment = (async(req,res)=>{
    const planid = req.params.planid;
    
    const plandata = await plandetails.findOne({planId:planid});
    tourplanarr[0] = plandata.price;
    tourplanarr[1] = plandata.planId;
    tourplanarr[2] = plandata.id;
    tourplanarr[3] = plandata.dealerid;
    searchdata[1] = plandata.noofdays;
    
    amount =Number(plandata.price)+((Number(plandata.price)*5)/100);
    amount = (amount*30)/100;
    console.log("amount : "+amount);

    let dateAndTime =    new Date().toLocaleString(); 
    
    let order =await instance.orders.create({
        amount : 100*100,
        currency : "INR",
        receipt : "Order_receipt_" + Date.now(),
        notes : {
          key1 : userdata[2],
          key2 : dateAndTime,
        }
    })

    orderID = order.id;

    res.status(201).json({
        success:true,
        order,
        amount,
    })
})

const paymentstatus = (async(req,res)=>{
    let paymentId = req.query.paymentid;
    let fname = req.query.fname;
    let lname = req.query.lname;
    let malecount = req.query.malecount;
    let femalecount = req.query.femalecount;
    let phonenumber = req.query.phonenumber
    let vegcount = req.query.vegcount;
    let nonvegcount = req.query.nonvegcount;
    await instance.payments.fetch(paymentId).then(async(paymentdata) => {
        // fetch success
        if(paymentdata.status ==='authorized'){
            await instance.payments.capture(paymentId, paymentdata.amount).then(async(capturedata) => {
                //capture success
                let balenceamount =(Number(tourplanarr[0])+((Number(tourplanarr[0])*5)/100))-Number(capturedata.amount/100);
                const paymentdataupload = new paymentstatusdb({
                    paymentid : capturedata.id,
                    orderid : orderID,
                    userid : userdata[2],
                    busid : tourplanarr[2],
                    planid : tourplanarr[1],
                    dealerid:tourplanarr[3],
                    status : capturedata.status,
                    Managerflag : 0,
                    amount : capturedata.amount/100,
                    balenceamount : balenceamount,
                    dateAndTime : new Date().toLocaleString(),
                    malecount : malecount,
                    femalecount :femalecount,
                    fname :fname,
                    lname :lname,
                    phonenumber : phonenumber,
                    vegcount : vegcount,
                    nonvegcount : nonvegcount,
                })

                let Fromdate = searchdata[0];
                let Todate = calculateNextDate(searchdata[0],searchdata[1]); 
                const orderdataupload = new orderdatadb({
                    orderid : orderID,
                    fromdate : Fromdate,
                    todate : Todate,
                    pickup:searchdata[2],
                })

                const newBooking = {
                    startdate : Fromdate,
                    endDate : Todate
                };
                busbookingstatus.findOneAndUpdate(
                    { busid : tourplanarr[2] },
                    { $push : { bookings: newBooking } },
                    { new : true }
                  )
                  .then(updatedBus => {
                    if (updatedBus) {
                      console.log('Booking data added:');
                    } else {
                      console.log('Bus not found');
                    }
                  })
                  .catch(error => {
                    console.error('Error adding booking data:', error);
                  });
    
                await paymentdataupload.save().then(async(data)=>{
                    console.log("Payment detail added in DB");
                    await orderdataupload.save().then((data1)=>{
                        console.log("Order data detail added in DB");
                        res.status(201).json({
                            success:true,
                            capturedata,
                        })
                    }).catch(e=>{
                        console.log("Error occured while adding order detail"+error);
                    })
                }).catch((error)=>{
                    //capture fail
                    console.log("Error occured while adding Payment detail"+error);
                })
            }).catch((error) => {
                //fetch failure
                console.log("Error while capture the Payment : "+error);
            })
        }
        else{
            //fail
            let balenceamount =(Number(tourplanarr[0])+((Number(tourplanarr[0])*5)/100));
            const paymentdataupload = new paymentstatusdb({
                paymentid : paymentdata.id,
                orderid : orderID,
                userid : userdata[2],
                busid : tourplanarr[2],
                planid : tourplanarr[1],
                dealerid:tourplanarr[3],
                status : paymentdata.status,
                amount : "0",
                balenceamount : balenceamount,
                dateAndTime : new Date().toLocaleString(),
            })
            let Fromdate = searchdata[0];
            let Todate = calculateNextDate(searchdata[0],searchdata[1]); 
            const orderdataupload = new orderdatadb({
                orderid:orderID,
                fromdate:Fromdate,
                todate:Todate,
                pickup:searchdata[2],
            })

            await paymentdataupload.save().then(async(data)=>{
                console.log("Payment detail added in DB");
                await orderdataupload.save().then((data1)=>{
                    console.log("Order data detail added in DB");
                }).catch(e=>{
                    console.log("Error occured while adding order detail"+error);
                })
            })
        }
      }).catch((error) => {
        // error
        console.error("Error fetching payment details:", error);
      })
})

const bookingdata = (async(req,res)=>{

    let upcomingTour = [];
    let upcomingTourIndex = 0;
    let completedTour = [];
    let completedTourIndex = 0;
    let failedTour = [];
    let failedTourIndex = 0;

    await paymentstatusdb.find({userid:userdata[2]}).then(async(paymentdata)=>{
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
                                    temp[15] = false;
                                    for (let indexr = 0; indexr < dealerdata.manager.length; indexr++) {
                                        for (let indexc = 0; indexc < dealerdata.manager[indexr].bookings.length; indexc++) {
                                            if(dealerdata.manager[indexr].bookings[indexc].orderid === paymentdata[paymentindex].orderid){
                                                temp[15] = true;
                                                let dummy =[];
                                                dummy[0] = dealerdata.manager[indexr].mname;
                                                dummy[1] = dealerdata.manager[indexr].mcontactno;
                                                dummy[2] = dealerdata.manager[indexr].mgender;
                                                temp[16] = dummy 
                                                break;
                                            }
                                        }
                                    }
                                    upcomingTour[upcomingTourIndex++] = temp;
                                }
                            }
                            else{
                                failedTour[failedTourIndex++] = temp;
                            }
                        }
                    }
                })
            }
            upcomingTour.reverse();
            failedTour.reverse();
            completedTour.reverse();
            if (upcomingTour.length === 0 && completedTour.length === 0 && failedTour.length === 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, 'upcomingwarning': true, 'completedwarning': true, 'failedwarning': true });
            } else if (upcomingTour.length !== 0 && completedTour.length === 0 && failedTour.length === 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, upcomingTour, 'completedwarning': true, 'failedwarning': true });
            } else if (upcomingTour.length === 0 && completedTour.length !== 0 && failedTour.length === 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, 'upcomingwarning': true, completedTour, 'failedwarning': true });
            } else if (upcomingTour.length === 0 && completedTour.length === 0 && failedTour.length !== 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, 'upcomingwarning': true, 'completedwarning': true, failedTour });
            } else if (upcomingTour.length !== 0 && completedTour.length !== 0 && failedTour.length === 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, upcomingTour, completedTour, 'failedwarning': true });
            } else if (upcomingTour.length !== 0 && completedTour.length === 0 && failedTour.length !== 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, upcomingTour, 'completedwarning': true, failedTour });
            } else if (upcomingTour.length === 0 && completedTour.length !== 0 && failedTour.length !== 0) {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, 'upcomingwarning': true, completedTour, failedTour });
            } else {
                res.render('booking', { 'upcoming': true, 'completed': true, 'failed': true, upcomingTour, completedTour, failedTour });
            }            
        }
    }).catch(e=>{
        console.log("Error While fetching paymentstatusdb data in bookingdata : "+e)
        res.render('404');
    })
})

const downloadpdf = (async (req, res) => {
    let orderid = req.params.orderid+"";
    let temp = [];

    await paymentstatusdb.findOne({orderid:orderid}).then(async(paymentdata)=>{
        if(paymentdata){
            await orderdatadb.findOne({orderid:paymentdata.orderid}).then(async(orderdata)=>{
                if(orderdata){
                    let buscontentdata = await busdetails.findOne({id:paymentdata.busid});
                    if(buscontentdata){
                        const dealerdata = await dealerdetails.findOne({dealerid:paymentdata.dealerid})
                        temp[0] =  dealerdata.dealername;
                        temp[1] = buscontentdata.busname;
                        temp[2] = buscontentdata.busimage[0].ContentType+";base64,"+buscontentdata.busimage[0].data.toString('base64');
                        temp[3] = orderdata.orderid;
                        let cycle = paymentdata.dateAndTime.substring(paymentdata.dateAndTime.length-2,paymentdata.dateAndTime.length)
                        cycle = cycle.toUpperCase();
                        temp[4] = paymentdata.dateAndTime.substring(0,paymentdata.dateAndTime.length-2)+""+cycle;
                        temp[5] = reverseData(orderdata.fromdate);
                        temp[6] = reverseData(orderdata.todate);
                        temp[8] = orderdata.pickup;
                        const plandata = await plandetails.findOne({planId:paymentdata.planid});
                        let tempstr = plandata.coverlocation.substring(0, plandata.coverlocation.length-1);
                        let str = tempstr.split('-');
                        temp[9] = str;
                        temp[10] = paymentdata.amount;
                        temp[11] = paymentdata.balenceamount;
                        temp[12] = Number(temp[10])+Number(temp[11]);
                        temp[13] = dealerdata.phonenumber;
                        let dummy=[];
                        for(let ind =0;ind<plandata.dayplans.length;ind++){
                            let temp_store =[];
                            temp_store[0] = plandata.dayplans[ind].day +" - "+plandata.dayplans[ind].mainspot;
                            temp_store[1] = plandata.dayplans[ind].content;
                            let temp_img = [];
                            for(let imgind =0;imgind<plandata.dayplans[ind].imageclips.length;imgind++){
                                temp_img[imgind] = plandata.dayplans[ind].imageclips[imgind].ContentType+";base64,"+plandata.dayplans[ind].imageclips[imgind].data.toString('base64');;
                            } 
                            temp_store[2] = temp_img;
                            dummy[ind] = temp_store;
                        }
                        temp[16] = dummy;
                        dummy = [];
                        dummy [0] = buscontentdata.seatcount;
                        dummy [1] = buscontentdata.musicsystem;
                        dummy [2] = buscontentdata.acornonac;
                        dummy [3] = buscontentdata.seattype;
                        dummy [4] = buscontentdata.waterfilter;
                        dummy [5] = buscontentdata.lighting;
                        dummy [6] = buscontentdata.wifi;
                        dummy [7] = buscontentdata.lagguagestorage;
                        dummy [8] = buscontentdata.entertainsystem;
                        temp[17] = dummy;
                    }
                }
            })
        }
    })

    await userdb.findOne({Email:userdata[2]}).then(data=>{
        temp[14] = data.fname+" "+data.lname;
        temp[15] = data.phonenumber.number;
    })

    const rows = temp[16].length;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlContent = `
    <html lang="en">
    <head>
        <title>temp</title>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;500;600;700;800&family=Philosopher&display=swap" rel="stylesheet">
    </head>
    <style>
        *{
            padding: 0px;
            margin: 0px;
            font-family: 'Open Sans', sans-serif;
            font-style: normal;
        }
        .outer_main{
            min-width: 800px;
            margin: 10px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            border-style: solid;
    
        }
        .logo_invoice-content{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        .appicon{
            width: 140px;
            height: 80px;
        }
        .invoice_content{
            display: flex;
            flex-direction: column;
            align-items: end;
        }
        .customer-content {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 5px;
            margin-top: 10px;
            border-style: solid;
            border-width: 1px;
        }
        .dealer-content {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 5px;
            margin-top: 10px;
            border-style: solid;
            border-width: 1px;
        }
        .customer-header{
            font-size: 15px;
            font-weight: 600;
            color: #2d3467;
        }
        .order_data{
            font-size: 12px;
            font-weight: 600;
        }
        .dealer-header{
            font-size: 15px;
            font-weight: 600;
            color: #2d3467;
        }
        .date_content{
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            font-size: 18px;
            font-weight: 700;
            color: #7b014c;
        }
        .amount-content {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            font-size: 18px;
            font-weight: 700;
            color: #2d3467;
        }
        .pickup_cover_location{
            display: flex;
            flex-direction: row;
            gap: 40px;
        }
        p.pickup_location-content {
            text-wrap: wrap;
            width: 420px;
            font-size: 14px;
            font-weight: 600;
        }
        .pickup_cover_header {
            color: #2d3467;
            font-size: 20px;
            font-weight: 700;
        }
        .place_content{
            display: flex;
            flex-direction: row;
            column-gap: 10px;
            font-size: 14px;
            font-weight: 600;
        }
        .fa-location-dot{
            color: #7b014c;
        }
        .place-header{
            font-size: 20px;
            font-weight: 700;
            color: #7b014c;
        }
        .termsandcondition_header{
            font-size: 20px;
            color: #2d3467;
            font-weight: 700;
        }
        .amount_paid {
            font-size: 20px;
            font-weight: 700;
            display: flex;
            gap: 15px;
            flex-direction: column;
        }
        p.amount_details {
            display: flex;
            justify-content: flex-end;
            padding: 5px;
        }
        p.termsandcondition_content_header {
            font-size: 18px;
            margin-top: 10px;
            font-weight: 600;
            color: #7b014c;
        }
        ul {
            margin-left: 20px;
        }
        #busimage {
            width: 340px;
            height: 170px;
            border-radius: 5px;
            box-shadow: 0px 0px 5px -1px #2d3467;
        }
        .busfeature_content{
            display: flex;
            flex-direction: row;
            column-gap: 30px;
        }
        .spotimage{
            width: 250px;
            box-shadow: 0px 0px 5px -1px #2d3467;
            border-radius: 5px;
            height :140px;
            margin-left:10px;
            margin-bottom:10px;
        }
        .total_feature_content{
            display: flex;
            width:400px;
            flex-wrap:wrap;
            gap:20px;
            flex-direction:column;
            color: #2d3467;
        }
        .feature_data{
            display:flex;
            flex-direction:row;
            column-gap:10px;
        }
        .features_data_content{
            display:flex;
            flex-direction:row;
            gap:10px;
            font-size:20px;
            font-weight:700;
        }
    </style>
    <body>
        <div class="outer_main">
            <div class="logo_invoice-content">
                <img class="appicon" src="https://lh3.googleusercontent.com/drive-viewer/AITFw-zMgx0BYz9_pdcHXtllQIIRAkq44PQrrx8yysDqJu6QSLd1ZN0CUn-sKTmH4PxuMUx4ZoHWUxSy3lE9-bdsxYdUmY0_Kg=s2560" alt="Company Logo">
                <div class="invoice_content">
                    <p style="font-size: 20px;font-weight:800">INVOICE</p>
                    <p class="order_data">Order_id : ${temp[3]}</p>
                    <p class="order_data">Order_date : ${temp[4]}</p>
                </div>
            </div><br>
            <div class="date_content">
                <p><i class="fa-solid fa-plane-departure fa-xs"></i> Journey Starts : ${temp[5]}</p>
                <p><i class="fa-solid fa-plane-arrival fa-xs"></i> Journey Ends : ${temp[6]}</p>
            </div>
            <div class="customer-content">
                <div>
                    <p class="customer-header">Customer Name</p>
                    <p>${temp[14]}</p>
                </div>
                <div>
                    <p class="customer-header"><i class="fa-solid fa-envelope fa-xs"></i> Customer Email</p>
                    <p>${userdata[2]}</p>
                </div>
                <div>
                    <p class="customer-header"><i class="fa-solid fa-phone fa-xs"></i> Customer Contact No</p>
                    <p> ${temp[15]}</p>
                </div>
            </div>
    
            <div class="dealer-content">
                <div>
                    <p class="dealer-header">Bus Name</p>
                    <p>${temp[1]}</p>
                </div>
                <div>
                    <p class="dealer-header">Bus Company Name</p>
                    <p>${temp[0]}</p>
                </div>
                <div>
                    <p class="dealer-header"><i class="fa-solid fa-phone fa-xs"></i> Dealer Contact No</p>
                    <p>${temp[13]}</p>
                </div>
            </div><br>
            <div class="busfeature_content">
                <div>
                    <img id="busimage" src="data:${temp[2]}" alt="busimage">
                </div>
                <div class ="total_feature_content">
                    <div class="features_data_content">
                        ${temp[17][0] ? `<p class="feature_content">${temp[17][0]} Seater</p>`:''}
                        ${temp[17][2] ? `<p class="feature_content"> AC</p>`:'<p class="pickup_location-content"> Non AC< /p>'}
                        <p class="feature_content"> ${temp[17][3]}</p>
                    </div>
                   <div class="feature_data">
                        ${temp[17][1] ? `<p class="feature_content"><i class="fa-solid fa-music"></i> Sound System</p>`:''}
                        ${temp[17][4] ? `<p class="feature_content"><i class="fa-solid fa-glass-water-droplet"></i> Water Filter</p>`:''}
                        ${temp[17][5] ? `<p class="feature_content"><i class="fa-solid fa-lightbulb"></i> Ambient lighting</p>`:''}
                        ${temp[17][6] ? `<p class="feature_content"><i class="fa-solid fa-wifi"></i> Wifi</p>`:''}
                        ${temp[17][7] ? `<p class="feature_content"><i class="fa-solid fa-suitcase-rolling"></i> Lagguage Storage</p>`:''}
                        ${temp[17][8] ? `<p class="feature_content"><i class="fa-solid fa-tv"></i> Entertainment System</p>`:''}
                   </div>
                </div>
            </div><br>
            <div class="pickup_cover_location">
                <div>
                    <p class="pickup_cover_header">Pick Up Location</p>
                    <p class="pickup_location-content">${temp[8]}</p>
                </div>
                <div>
                    <p class="pickup_cover_header">Cover Location</p>
                    <div class="place_content">
                        ${temp[9].map(place => `<p><i class="fa-solid fa-location-dot"></i> ${place}</p>`).join('')}
                    </div>
                </div>
            </div><br>
            <div>
                ${Array.from({ length: rows }, (_, rowIndex) =>
                    `<div>
                        <p class="place-header">${temp[16][rowIndex][0]}</p><br>
                        <div class="spot_image_class">
                            ${temp[16][rowIndex][2].map(img => `<img class="spotimage" src="data:${img}" alt="spot img">`).join('')}
                        </div>
                        <p>${temp[16][rowIndex][1]}</p>
                    </div><br>`
                ).join('')}
            </div><br>
            <div class="amount_paid">
                <hr>
                <div class="amount-content">
                    <p class="amount_details">Amount Paid : ${temp[10]}</p>
                    <p class="amount_details">Balance Amount : ${temp[11]}</p>
                </div>
                <hr>
            </div><br>
            <div>
                <p class="termsandcondition_header">Terms and Conditions</p>
                <p class="termsandcondition_content_header">Schedule and Itinerary</p>
                <ul>
                    <li>Departure and arrival times are subject to change based on factors such as traffic, weather, and other unforeseen circumstances.</li>
                    <li>Itineraries are subject to change, and the tour operator reserves the right to modify the route, stops, or attractions visited.</li>
                </ul>
                <p class="termsandcondition_content_header">Force Majeure</p>
                <ul>
                    <li> In the rare case of extraordinary circumstances beyond control (e.g., natural disasters, government actions), the property reserves the right to review and consider exceptions to this policy on a case-by-case basis.</li>
                    <li> Such exceptions, if granted, will be subject to the property's sole discretion.</li>
                </ul>
                <p class="termsandcondition_content_header">Passenger Responsibilities</p>
                <ul>
                    <li>Passengers must present a valid ticket (e-ticket or physical) at the time of boarding.</li>
                    <li>Passengers are required to follow the tour guide's instructions and adhere to safety guidelines while on the bus.</li>
                </ul>
                <p class="termsandcondition_content_header">Disclaimers</p>
                <ul>
                    <li>The property shall not be held liable for any inconvenience, losses, or damages arising from adherence to this no cancellation, no date change policy.</li>
                    <li>Guests are advised to obtain appropriate travel insurance to cover unforeseen circumstances.</li>
                </ul>
                <p class="termsandcondition_content_header">Agreement</p>
                <ul>
                    <li>By completing a booking under this policy, you acknowledge and agree to all the terms and conditions outlined above.</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    `;
  
    await page.setContent(htmlContent);
    const marginOptions = {
        top: '0.2in',
        bottom: '0.2in',
        left: '0.2in',
        right: '0.2in',
      };
    
    const pdfBuffer = await page.pdf({ format: 'A4', margin: marginOptions});
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.send(pdfBuffer);
  });

module.exports = {
    prepayment,
    paymentstatus,
    bookingdata,
    downloadpdf,
}