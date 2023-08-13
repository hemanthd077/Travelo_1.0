const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('OrderData mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the OrderData database');
})

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
})

const collection = new mongoose.model('OrderData',OrderSchema)

module.exports = collection;