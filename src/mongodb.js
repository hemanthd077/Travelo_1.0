const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    fname:{
        type:String,
        required : true,
    },
    lname:{
        type:String,
        required : true,
    },
    Email:{
        type: String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    phonenumber:{
        countrycode:String,
        number:String,
    },
    address:{
        type:String,
    },
    gender:{
        type:String,
    },
    flag:{
        type:Boolean,
        required:true,
    },
    profileimage:{
        data:Buffer,
        ContentType:String,
    },
    likedbus:[{
        busid:String,
    }],
})

const collection = new mongoose.model('collection1',loginSchema)

module.exports = collection;