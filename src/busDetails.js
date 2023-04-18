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

const busDetailsSchema = new mongoose.Schema({
    dealerid:{
        type:String,
        required : true,
    },
    busname:{
        type:String,
    },     
    seatcount:{
        type:String,
    },
    busimage:{
        data:Buffer,
        ContentType:String,
    },
})

const collection = new mongoose.model('Busimage',busDetailsSchema)

module.exports=collection;
