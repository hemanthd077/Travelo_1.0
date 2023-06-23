const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')
const uploaddb = require('../src/uploaddb')
const fs = require('fs')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure:true,
    auth: {
      user: 'traveloindia01@gmail.com',
      pass: 'xnxzxcsuxtidzkvk'
    },
  });

  
function generate() {
    return Math.floor(Math.random() * 90000) + 10000;
}

let usercode,token;
let UserData = []; 

const signup = async (req,res)=>{
    validation.findOne({Email : req.body.Email}).then(async(data)=>{
        if(data){
            res.status(400).render('signup',{'res':'Email-id already existed!','control':true})
        }
        else if(req.body.password != req.body.confirmPassword){
            return res.status(400).render('signup',{'res':'Password Not Matching','control':true})
        }
        else{
            const body = req.body;
            if(!(body.Email && body.fname && body.lname && body.password && body.confirmPassword))
            {
                return res.status(400).render('signup',{'res' : "details not entered properly",'control':true})
            }
            arr = [];
            arr[0] = req.body;

            const payload = { userId: generate()};
            const secretKey = 'your_valid_secret_key';
            const options = { expiresIn: '60s' }; // Token expiration time

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
                from: 'traveloindia01@gmail.com',
                to: req.body.Email,
                subject: 'Email Verification Link',
                html:`<!DOCTYPE html> <html> <head> <title>Email Verification Code</title> <style> body { font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px; } .container { max-width: 500px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); } h1 { text-align: center; color: #333; } p { line-height: 1.5; margin-bottom: 20px; } .verification-code { text-align: center; font-size: 24px; font-weight: bold; color: #333; margin-bottom: 30px; } .button { display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none; transition: background-color 0.3s; } .button:hover { background-color: #0056b3; } .footer { text-align: center; color: #777; font-size: 14px; margin-top: 40px; } </style> </head> <body> <div class="container"> <h1>Email Verification</h1> <p> Please verify your email address by clicking the below link</p> <a href="http://localhost:8080/verify?code=${usercode}">Click Here</a> <p>If you did not request this verification link, you can safely ignore this email.</p> <p> If you have any questions or need further assistance, please contact our support team at <a href="mailto:traveloindia01@gmail.com">TraveloIndia</a>. </p> <p class="footer"> This email is automatically generated. Please do not reply to this message. </p> </div> </body> </html>`,
                text: 'Your authentication token:'+ usercode,
            };
            
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                console.error('Error sending email:', error);
                } else {
                console.log('Email sent:', info.response);
                }
            });
            res.redirect('/activation');
        }
    }).catch((err)=>{
        console.log(err)
    })
}

const verify = async (req,res)=>{
    const verificationCode = req.query.code;
    console.log("verificationCode:" + verificationCode);
    console.log("usertoken:"+ usercode);
    let code = usercode.toString()
    if(verificationCode=== code){
        const hashedpassword = await bcrypt.hash(arr[0].password, 10);
        arr[0].password = hashedpassword.toString();
        
        const newvalues = new uploaddb({
            userid:arr[0].Email,
            profileimage:{
                data:fs.readFileSync('public/images/user.png'),
                ContentType:'image/png'
            },
        })

        validation.findOne({Email : arr[0].Email}).then(async(data)=>{
            if(data){
                console.log("User already Exist so redirect to login.");
                res.redirect('/');
            }
            else{
                newvalues.save().then(()=>{
                    console.log('successfully uploaded')}).catch((err)=>console.log(err))
        
                validation.insertMany([arr[0]])
            
                res.render('verify');
            }
        })
    }
    else{
        console.log('Verify the email first');
    }
}

module.exports = {
    signup,
    verify,
};

