const mongoose = require('mongoose');

const busDetailsSchema = new mongoose.Schema({
    id:{
        type:String,
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
    rating:{
        currentrating:String,
        count:String,
    },
    wifi:{
        type:String,
    },
    lagguagestorage:{
        type:String,
    },
    entertainsystem:{
        type:String,
    },
    busimage:[{
        data:Buffer,
        ContentType:String,
    }],
})

const collection = new mongoose.model('Busimage',busDetailsSchema)

module.exports=collection;
