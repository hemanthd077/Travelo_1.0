const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')
const fs = require('fs')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const TRANSPORT_USER = process.env.EMAILTRANSPORT_USER
const TRANSPORT_PASSWORD = process.env.EMAILTRANSPORT_PASSWORD;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure:true,
    auth: {
      user: TRANSPORT_USER,
      pass: TRANSPORT_PASSWORD
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
            req.body.flag=false;
            arr = [];
            arr[0] = req.body;

            const payload = { userId: req.body.Email};
            const secretKey = generate().toString();
            const options = { expiresIn: '60s' }; // Token expiration time

            token = jwt.sign(payload, secretKey, options);
            const decodedToken = jwt.decode(token);
            if (decodedToken && decodedToken.userId) {
                usercode = secretKey;
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
                html:`<!DOCTYPE html> 
                    <html> 
                    <head> 
                        <title>Email Verification Code</title>
                        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
                        <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
                        <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            padding: 20px;
                        } 
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            background-color: #fff;
                            padding: 30px;
                            border-radius: 5px;
                            border: 1px solid gainsboro;
                            display: flex;
                            align-items: center;
                        }  
                        svg {
                            margin-left: -30px;
                            width: 560px;
                            margin-top: 90px;
                            position: absolute;
                        } 
                        h1 {
                            z-index: 2;
                            margin-top: -30px;
                            text-align: center;
                            color:black;
                            position: relative;
                        } 
                        p {
                            line-height: 1.5;
                        } 
                        .verification-code {
                            text-align: center;
                            font-size: 28px;
                            font-weight: bold;
                        }
                        button {
                        width: 120px;
                        height: 30px;
                        color: white;
                        background: #007bff;
                        border-radius: 5px;
                        border-style: none;
                        cursor: pointer;
                        font-size: 15px;
                    }
                    a{
                        text-decoration: none;
                        color:white;
                    }

                    button:hover{
                        background-color: #0056b3;
                        color:white;
                    }
                        .footer {
                            text-align: center;
                            color: #777;
                            font-size: 14px;
                            margin-top: 20px;
                        } 
                        </style> 
                    </head>
                    
                    <body style="font-family:'Montserrat', sans-serif;">
                        <div class="container">
                            <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td style="background-image: url(https://lh3.googleusercontent.com/drive-viewer/AITFw-xDFqJWr-vKyyle-8NrIGubwPsc2z-zhM9hkGD_PHkAi7pbP5UIM6TciN3KblpIYZVrfS7jxKUfqDinz3yB3Z3JJV0AXw=s2560); background-repeat: no-repeat; background-position: center; width: 560px; height: 300px;margin-left:-30px;position:absolute; margin-top:-70px"></td> 
                                </tr>
                                <tr style="display: flex;align-items: center;">
                                    <h1>Email Verification</h1>
                                    <p> Please verify your email address by clicking the below</p> 
                                    <button><a style="color: #FFFFFF" href="https://wild-gray-buffalo-hose.cyclic.cloud/verify?code=${usercode}">Click Here</a></button> 
                                    <p>If you did not request this verification link, you can safely ignore this email.If you have any questions or need further assistance, please contact our support team at <a href="mailto:traveloindia01@gmail.com">TraveloIndia</a>.</p> 
                                    <p class="footer"> This email is automatically generated. Please do not reply to this message. </p>
                                    <p style="text-align: center;color: #777;font-size: 11px;font-weight: 600;">&#169; Copyrighted 2023 </p>
                                </tr>
                            </table>
                            
                        </div>
                    </body>
                </html>`,
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
    if(verificationCode === code){
        const hashedpassword = await bcrypt.hash(arr[0].password, 10);
        arr[0].password = hashedpassword.toString();
        
        const newvalues = new validation({
            fname:arr[0].fname,
            lname:arr[0].lname,
            Email:arr[0].Email,
            password:arr[0].password,
            flag:arr[0].flag,
            phonenumber:"",
            address:"",
            gender:"",
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

