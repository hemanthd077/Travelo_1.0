const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const templatePath = path.join(__dirname,'./tempelates')
var RateLimit = require('express-rate-limit');

const mongoose = require('mongoose');

require('dotenv').config();

const monogourl = process.env.MONGO_URL
const monogoport = process.env.PORT


mongoose.connect(monogourl,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('mongodb connected sucessfully');   ``
})
.catch(()=>{
    console.error(Error);
    console.log('failed to connect the database');
})


require('dotenv').config();
const secret = process.env.SESSION_SECERT;

app.use(express.json())
app.set('view engine','hbs');
app.set('views',templatePath);

app.use(express.static('public'))

app.use(express.urlencoded({extended:false}))

const loginRoutes = require('./routes/loginroutes')
const signupRoutes = require('./routes/signuproutes')
const homeRoutes = require('./routes/homeroutes')
const dealerRoutes = require('./routes/dealerroutes')
const profileRoutes = require('./routes/profileroutes')
const likeRoutes = require('./routes/likeroutes')
const dealerhomeroutes = require('./routes/dealerhomeroutes')
const booking = require('./routes/bookingroutes')
const maproutes = require('./routes/map');
const passport = require('passport');
const session = require('express-session');


require('./src/passport')
app.use(session({secret:secret}))
app.use(passport.initialize())
app.use(passport.session())


app.use(loginRoutes)
app.use(signupRoutes)
app.use(homeRoutes)
app.use(dealerRoutes)
app.use(likeRoutes) 
app.use(profileRoutes)
app.use(dealerhomeroutes)
app.use(maproutes)
app.use(booking)

app.use((req,res,next)=>{
    res.render('404')
})

// var limiter = RateLimit({
//   windowMs: 1*60*1000,
//   max: 5
// });
// app.use(limiter);

app.listen(monogoport,()=>{
    console.log('Connected to Server');
})

