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
    amount:{
        type : String,
    },
    balenceamount:{
        type : String
    },
    dateAndTime:{
        type : String
    }
})

const collection = new mongoose.model('paymentDB',PaymentSchema)

module.exports = collection;