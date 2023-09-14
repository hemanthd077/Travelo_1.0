const { intToRGBA } = require('jimp');
const { Long } = require('mongodb');
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    paymentid:{
        type : String,
        unique : true,
    },
    orderid:{
        type : String,
    },
    userid:{
        type : String,
    },
    busid:{
        type : String,
    },
    planid:{
        type : String,
    },
    dealerid:{
        type : String,
    },
    status:{
        type : String,
    },
    Managerflag:{
        type : Boolean,
    },
    amount:{
        type : String,
    },
    balenceamount:{
        type : String,
    },
    dateAndTime:{
        type : String,
    },
    malecount : {
        type : String,
    },
    femalecount :{
        type : String,
    },
    fname :{
        type : String,
    },
    lname :{
        type : String,
    },
    phonenumber : {
        type : String,
    },
    vegcount : {
        type : String,
    },
    nonvegcount :{
        type : String,
    },
    rating : {
        type : String,
    },
})

const collection = new mongoose.model('paymentDB',PaymentSchema)

module.exports = collection;