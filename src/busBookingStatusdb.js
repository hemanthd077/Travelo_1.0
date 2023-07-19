const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('Bus Booking Status mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the Bus Booking database');
})

const BusBookingStatus = new mongoose.Schema({
    busid:{
        type:String,
        required : true,
        unique:true,
    },
    bookings:[{
        startdate:String,
        endDate:String,
    }]
})


const collection = new mongoose.model('BusBookingStatus',BusBookingStatus)

module.exports = collection;