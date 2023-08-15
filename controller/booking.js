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
    let paymentId = req.params.paymentid+"";
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
                    amount : capturedata.amount/100,
                    balenceamount : balenceamount,
                    dateAndTime : new Date().toLocaleString(),
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


module.exports = {
    prepayment,
    paymentstatus,
    bookingdata,
}