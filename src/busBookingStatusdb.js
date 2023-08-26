const mongoose = require('mongoose');

const BusBookingStatus = new mongoose.Schema({
    busid:{
        type:String,
        required : true,
        unique:true,
    },
    bookings:[{
        startdate:String,
        endDate:String,
    }]
})


const collection = new mongoose.model('BusBookingStatus',BusBookingStatus)

module.exports = collection;