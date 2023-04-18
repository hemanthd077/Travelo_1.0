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

app.use(loginRoutes)
app.use(signupRoutes)
app.use(homeRoutes)
app.use(dealerRoutes)
app.use(profileRoutes)
app.use(dealerhomeroutes)


app.use((req,res,next)=>{
    res.render('404')
})

app.listen(8080,()=>{
    console.log('Connected to Server');
})
