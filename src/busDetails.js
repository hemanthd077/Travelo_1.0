const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('BusDetails mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the BusDetails database');
})

const busDetailsSchema = new mongoose.Schema({
    id:{
        type:String,
        unique : true,
    },
    dealerid:{
        type:String,
    },
    busname:{
        type:String,
    },     
    seatcount:{
        type:String,
    },
    musicsystem:{
        type:String,
    },
    acornonac:{
        type:String,
    },
    seattype:{
        type:String,
    },
    waterfilter:{
        type:String,
    },
    lighting:{
        type:String,
    },
    busimage:[{
        data:Buffer,
        ContentType:String,
    }],
})

const collection = new mongoose.model('Busimage',busDetailsSchema)

module.exports=collection;
