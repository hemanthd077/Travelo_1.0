const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('Payment mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the Payment database');
})

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