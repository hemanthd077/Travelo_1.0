const mongoose = require('mongoose');

const dealerloginSchema = new mongoose.Schema({
    dealerid:{
        type:String,
        required : true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    dealername:{
        type:String
    },
    city:{
        type:String,
    },
    phonenumber:{
        type:String,
    },
    profileimage:{
        data:Buffer,
        ContentType:String,
    },
    manager:[{
        mname:String,
        mgender:String,
        mcontactno:String,
        memail:String,
        mpassword:String,
        bookings:[{
            startdate:String,
            endDate:String,
            orderid:String,
            busid:String,
        }],
        mprofileimage:{
            data:Buffer,
            ContentType:String,
        },
    }]
})

const collection = new mongoose.model('dealerdetails',dealerloginSchema)

module.exports = collection;

