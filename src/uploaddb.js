const mongoose = require('mongoose');

mongoose.connect(`mongodb://0.0.0.0:27017/userdetails`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('upload mongodb connected sucessfully');
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the upload database');
})



const imageSchema = new mongoose.Schema({
    userid:{
        type:String,
        required : true,
        unique:true,
    }, 
    profileimage:{
        data:Buffer,
        ContentType:String,
    },
})

const collection = new mongoose.model('profileimage',imageSchema)

module.exports=collection;