const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    orderid:{
        type:String,
        unique:true,
    },
    rating:{
        type:Decimal128,
    }
})

const collection = new mongoose.model('Likedb',likeSchema)

module.exports = collection;

