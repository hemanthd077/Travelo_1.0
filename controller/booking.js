const async = require('hbs/lib/async');
const Login = require('../controller/login');
const home = require('../controller/home');
const Razorpay = require('razorpay');
const plandetails = require('../src/planDetails')
const paymentstatusdb = require('../src/paymentStatusdb')
const orderdatadb = require('../src/orderDatadb');
const busbookingstatus = require('../src/busBookingStatusdb');


let userdata = Login.mail();
let searchdata = home.userSearchdata();

let tourplanarr = [];
require('dotenv').config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
let instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })


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
                let Todate = calculateNextDate(searchdata[0],searchdata[1]-1); 
                const orderdataupload = new orderdatadb({
                    orderid : orderID,
                    fromdate : Fromdate,
                    todate : Todate,
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
                status : paymentdata.status,
                amount : "0",
                balenceamount : balenceamount,
                dateAndTime : new Date().toLocaleString(),
            })
            let Fromdate = searchdata[0];
            let Todate = calculateNextDate(searchdata[0],searchdata[1]-1); 
            const orderdataupload = new orderdatadb({
                orderid:orderID,
                fromdate:Fromdate,
                todate:Todate,
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


module.exports = {
    prepayment,
    paymentstatus,
}