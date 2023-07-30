const { Decimal128, Double } = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('Plan mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the Plan database');
})

const planDetailsSchema = new mongoose.Schema({
    id:{
        type:String,
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
        day:String,
        content:String,
    }],
    planfile:{
        data:Buffer,
        ContentType:String,
    },
})

const collection = new mongoose.model('plandoc',planDetailsSchema)

module.exports=collection;
