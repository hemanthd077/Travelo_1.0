const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderid:{
        type : String,
        unique:true,
    },
    fromdate:{
        type : String,
    },
    todate:{
        type : String
    },
    pickup:{
        type:String,
    }
})

const collection = new mongoose.model('OrderData',OrderSchema)

module.exports = collection;