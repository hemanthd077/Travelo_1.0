const mongoose = require('mongoose');

const planDetailsSchema = new mongoose.Schema({
    planId:{
        type:String,
        unique:true,
        required:true,
    },
    id:{
        type:String,
        unique: false,
        required:true,
    },
    dealerid:{
        type:String,
        required : true,
    },
    state:{
        type:String,
        required : true,
    },     
    busname:{
        type:String,
        required : true,
    },
    noofdays:{
        type:Number,
        required : true,
    },
    price:{
        type:Number,
        required : true,
    },
    coverlocation:{
        type:String,
        required : true,
    },
    dayplans:[{
        imageclips:[{
            data:Buffer,
            ContentType:String,
        }],
        mainspot:String,
        day:String,
        content:String,
    }],
})

const collection = new mongoose.model('plandoc',planDetailsSchema)

module.exports=collection;
