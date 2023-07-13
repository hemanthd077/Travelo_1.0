const { Decimal128, Double } = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('dealer mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the dealer database');
})

const planDetailsSchema = new mongoose.Schema({
    id:{
        type:String,
        unique : true,
    },
    dealerid:{
        type:String,
    },
    state:{
        type:String,
    },     
    busname:{
        type:String,
    },
    noofdays:{
        type:Number,
    },
    price:{
        type:Number,
    },
    coverlocation:{
        type:String,
    },
    planfile:{
        data:Buffer,
        ContentType:String,
    },
})

const collection = new mongoose.model('plandoc',planDetailsSchema)

module.exports=collection;
