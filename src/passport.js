const passport = require('passport');

const googleStrategy = require('passport-google-oauth2').Strategy

const GOOGLE_CLIENT_ID = '1071737044428-0331ch9q6apm384i1oqka6g565q03lui.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET  = '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'

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