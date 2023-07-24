const passport = require('passport');

require('dotenv').config();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET;

const googleStrategy = require('passport-google-oauth2').Strategy


passport.use(new googleStrategy({
    clientID:GOOGLE_CLIENT_ID,
    clientSecret:GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:8080/googlelogin",
    passReqToCallback:true
 },
    function(request,accessToken,refreshToken,profile,done){
        return done(null,profile)
    }
 ))

 passport.serializeUser(function(user,done){
    done(null,user);
 });

 passport.deserializeUser(function(user,done){
    done(null,user);
 });