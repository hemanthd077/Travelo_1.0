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

const dealerloginSchema = new mongoose.Schema({
    dealerid:{
        type:String,
        required : true,
    },
    password:{
        type:String,
        required:true
    }
})

const collection = new mongoose.model('dealerdetails',dealerloginSchema)

module.exports = collection;

