const validation = require('../src/mongodb')
const uploaddb = require('../src/uploaddb')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const async = require('hbs/lib/async');
const fs = require('fs');
const axios = require('axios');
const mime = require('mime');

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
            if(data.flag===true){
                res.status(400).render('login',{'res':'User does not Exist','control':true,login:true});
            }
            else{
                const validpassword = await bcrypt.compare(req.body.password,data.password)
                if(validpassword){
                    res.render('home',{content:true})
                }
                else{
                    res.status(400).render('login',{'res':'Invalid Password','control':true,login:true})
                }
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
            to: data.Email,
            subject: 'verification code',
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
                        display:flex;
                        flex-direction:colomn
                    } 
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 30px;
                        border-radius: 5px;
                        border: 1px solid gainsboro;
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
                        color: #007bff;
                        position: relative;
                    } 
                    p {
                        line-height: 1.5;
                    } 
                    .verification-code {
                        text-align: center;
                        font-size: 28px;
                        margin-bottom: -15px;
                        font-weight: bold;
                        margin-top: -5px;
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
                                <td style="background-image: url(https://lh3.googleusercontent.com/drive-viewer/AFGJ81ohz6q6b-L-4vqvsvgkNZ6I2AD6Igskizea3c3e4bwj76ph5U0dulnF9tclQQuSsgM4x1S-x8UcrXgYu7yky1G4f65qLQ=s2560); background-repeat: no-repeat; background-position: center; width: 560px; height: 300px;margin-left:-30px;position:absolute; margin-top:-70px"></td>
                            </tr>
                        </table>
                        <h1>Email Verification</h1>
                        <p>Forgot Password! Please verify your email address by entering the verification code:</p>
                        <p class="verification-code">${usercode}</p>
                        <p>If you did not request this verification code, you can safely ignore this email.If you have any questions or need further assistance, please contact our support team at <a href="mailto:traveloindia01@gmail.com">TraveloIndia</a>. </p>
                        <p class="footer"> This email is automatically generated. Please do not reply to this message.</p>
                        <p style="text-align: center;color: #777;font-size: 11px;font-weight: 600;">&#169; Copyrighted 2023 </p>
                    </div>
                </body>
            </html>`,
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

const googleLogin = (async(req,res)=>{
    // console.log(req.user);
    // res.write(JSON.stringify(req.user));

    validation.findOne({Email : req.user.email}).then(async(data)=>{
        if(data){
            if(data.flag===false){
                res.render('login',{'res':'User Account Already Exist.Try with other E mail-id','control':true,login:true})
            }
            else{
                detailsArray[0]=data.fname.toUpperCase();
                detailsArray[1]=data.lname.toUpperCase();
                detailsArray[2]=data.Email;
                res.render('home')
            }
        }
        else{
            //need to proceed signup

            axios
            .get(req.user.picture, { responseType: 'arraybuffer' })
            .then(response => {
                const imageBuffer = Buffer.from(response.data, 'binary');
            
                const newvalues = new uploaddb({
                    userid: req.user.email,
                    profileimage: {
                    data: imageBuffer,
                    ContentType: 'image/png'
                    }
                });
                
                newvalues.save().then(()=>{
                    console.log('google login profile photo added')}).catch((err)=>console.log(err))
            })
            const hashedpassword = await bcrypt.hash(req.user.sub, 10);
            const pwd = hashedpassword.toString();
            const newdata = new validation({
                fname: req.user.given_name,
                lname: req.user.family_name,
                Email: req.user.email,
                password:pwd,
                flag:true,
            })
            await newdata.save().then(()=>{
                console.log('google login account created')}).catch((err)=>console.log(err))
                validation.findOne({Email:req.user.email}).then(async(user)=>{
                    detailsArray[0]=user.fname.toUpperCase();
                    detailsArray[1]=user.lname.toUpperCase();
                    detailsArray[2]=user.Email;
                    res.render('home',{content:true})
                }).catch((err)=>console.log('error in finding'))
        }
    })
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
    googleLogin,
};


