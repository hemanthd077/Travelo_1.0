const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const templatePath = path.join(__dirname,'../tempelates')

app.use(express.json())
app.set('view engine','hbs');
app.set('views',templatePath);

app.use(express.static('public'))

app.use(express.urlencoded({extended:false}))

const loginRoutes = require('../routes/loginroutes')
const signupRoutes = require('../routes/signuproutes')
const homeRoutes = require('../routes/homeroutes')
const dealerRoutes = require('../routes/dealerroutes')
const profileRoutes = require('../routes/profileroutes')
const dealerhomeroutes = require('../routes/dealerhomeroutes')
const booking = require('../routes/bookingroutes')
const maproutes = require('../routes/map');
const passport = require('passport');
const session = require('express-session');


require('../src/passport')
app.use(session({secret:'cats'}))
app.use(passport.initialize())
app.use(passport.session())


app.use(loginRoutes)
app.use(signupRoutes)
app.use(homeRoutes)
app.use(dealerRoutes)
app.use(profileRoutes)
app.use(dealerhomeroutes)
app.use(maproutes)
app.use(booking)


app.use((req,res,next)=>{
    res.render('404')
})

app.listen(8080,()=>{
    console.log('Connected to Server');
})
