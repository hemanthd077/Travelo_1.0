const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('user mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the user database');
})


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
    }
})

const collection = new mongoose.model('collection1',loginSchema)

module.exports = collection;