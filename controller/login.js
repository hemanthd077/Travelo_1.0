const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const async = require('hbs/lib/async');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'traveloindia01@gmail.com',
      pass: 'xnxzxcsuxtidzkvk'
    }
  });

let detailsArray=[];

const login = async(req,res)=>{
    const mail=req.body.Email;
    
    validation.findOne({Email:mail}).then(async(user)=>{
        detailsArray[0]=user.fname.toUpperCase();
        detailsArray[1]=user.lname.toUpperCase();
        detailsArray[2]=user.Email;
    }).catch((err)=>console.log('error in finding'))
    
    validation.findOne({Email : req.body.Email}).then(async(data)=>{
        if(data){
            const validpassword = await bcrypt.compare(req.body.password,data.password)
            if(validpassword){
                res.render('home',{content:true})
            }
            else{
                res.status(400).render('login',{'res':'Invalid Password','control':true,login:true})
            }
        }
        else{
            res.status(400).render('login',{'res':'User does not Exist','control':true,login:true});
        }
    }).catch((err)=>{
        console.log(err)
    })
}


function generate() {
    return Math.floor(Math.random() * 90000) + 10000;
}

let usercode,token;

const fpass_nodemail=(async(req,res)=>{
    let data = await validation.findOne({Email:req.body.Email});
    if(data){
        detailsArray[2] = req.body.Email;
        console.log("forget password:"+detailsArray[2]);
        // Generate a token
        const payload = { userId: generate()};
        const secretKey = 'your_valid_secret_key';
        const options = { expiresIn: '1h' }; // Token expiration time

        token = jwt.sign(payload, secretKey, options);
        const decodedToken = jwt.decode(token);
        if (decodedToken && decodedToken.userId) {
            usercode = parseInt(decodedToken.userId);
        }

        if (isNaN(usercode)) {
        console.log('Invalid code');
        } else {
        console.log('User ID:', usercode);
        }

        const mailOptions = {
            from: 'hemanth8356@gmail.com',
            to: data.Email,
            subject: 'verification code',
            html:'<!DOCTYPE html> <html> <head> <title>Email Verification Code</title> <style> body { font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px; } .container { max-width: 500px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); } h1 { text-align: center; color: #333; } p { line-height: 1.5; margin-bottom: 20px; } .verification-code { text-align: center; font-size: 24px; font-weight: bold; color: #333; margin-bottom: 30px; } .button { display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none; transition: background-color 0.3s; } .button:hover { background-color: #0056b3; } .footer { text-align: center; color: #777; font-size: 14px; margin-top: 40px; } </style> </head> <body> <div class="container"> <h1>Email Verification</h1> <p>Forgot Password! Please verify your email address by entering the verification code below:</p> <p class="verification-code">'+usercode+'</p> <p>If you did not request this verification code, you can safely ignore this email.</p> <p> If you have any questions or need further assistance, please contact our support team at <a href="mailto:traveloindia01@gmail.com">TraveloIndia</a>. </p> <p> To verify your email, click the button below: </p> <p> <a class="button" href="http://localhost:8080/">Login</a> </p> <p class="footer"> This email is automatically generated. Please do not reply to this message. </p> </div> </body> </html>',
            text: 'Your authentication token:'+ usercode
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
        });
        res.render('login',{verificationCode:true,email:detailsArray[2]})
    }
    else{
        res.render('login',{fpassword:true,warning:true})
    }
})

const verify_code = (async(req,res)=>{
    let code_string = req.body.index0+""+req.body.index1+""+req.body.index2+""+req.body.index3+""+req.body.index4;
    let enterCode = parseInt(code_string, 10);
    if(usercode ===enterCode){
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.render('login',{changepwd:true,email:detailsArray[2]})
        console.log("verifcation:"+detailsArray[2]);
    }
    else{
        console.log("Invalid");
        console.log("verifcation:"+detailsArray[2]);
        res.render('login',{verificationCode:true,invalid:true,emailid:detailsArray[2]})
    }
})

const changePassword =(async(req,res)=>{
    if(req.body.cpwd === req.body.rpwd){
        detailsArray[2]=req.body.email;
        console.log("changepassword"+detailsArray[2]);
        const hashedpassword = await bcrypt.hash(req.body.rpwd, 10);
        req.body.rpwd = hashedpassword.toString();
        const newvalues ={$set:{password:req.body.rpwd}};
        const filter = {Email: req.body.emailid}
        const options = { upsert: false };           
        await validation.updateOne(filter,newvalues,options, (err , collection) => {
            if(err){
                console.log('error'+err)
            }
            else{
                console.log("User Password Updated Successfully");
            }
        })
        res.redirect('/');
    }
    else{
        console.log("changepassword:"+detailsArray[2]);
        console.log("password not matched");
        res.render('login',{changepwd:true,email:detailsArray[2],invalid:true})

    }
})

function mail() {
    return detailsArray;
}

module.exports = {
    mail,
    login,
    fpass_nodemail,
    verify_code,
    changePassword,
};


