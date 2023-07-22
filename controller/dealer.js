const validation = require('../src/dealerdb')
const bcrypt = require('bcrypt')
const busdetails = require('../src/busDetails')
const axios = require('axios');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const TRANSPORT_USER = process.env.EMAILTRANSPORT_USER
const TRANSPORT_PASSWORD = process.env.EMAILTRANSPORT_PASSWORD;

function generate() {
    return Math.floor(Math.random() * 90000) + 10000;
}

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

let usercode,token;


let detailsArray=[];

const dealerlogin = async(req,res)=>{
    validation.findOne({dealerid : req.body.dealerid}).then(async(data)=>{
        if(data){
            detailsArray[0]=data.dealerid;
            const validpassword = await bcrypt.compare(req.body.password,data.password)
            if(validpassword){
                res.redirect('/busdetail');
            }
            else{
                res.status(400).render('dealer',{'res':'Invalid Password','control':true,login:true})
            }
        }
        else{
            res.status(400).render('dealer',{'res':'Dealer-Id does not Exist','control':true,login:true});
        }
    }).catch((err)=>{
        console.log(err)
    })
}

const dealerbus = (async(req,res)=>{
    let busname=[];
    await busdetails.distinct("busname",{dealerid:detailsArray[0]}).then(async(data)=>{
        for (let index = 0; index < data.length; index++) {
            busname[index] = data[index];
        }
    })
    res.render('dealerHome',{plan:true,busname})

})

const fpass_nodemail=(async(req,res)=>{
    let data = await validation.findOne({dealerid:req.body.dealerid});
    if(data){
        detailsArray[0] = req.body.dealerid;
        console.log("forget password:"+detailsArray[0]);
        // Generate a token
        const payload = { userId: generate()};
        const secretKey = 'your_valid_secret_key';
        const options = { expiresIn: '60s' }; // Token expiration time

        token = jwt.sign(payload, secretKey, options);
        const decodedToken = jwt.decode(token);
        if (decodedToken && decodedToken.userId) {
            usercode = parseInt(decodedToken.userId);
        }
        console.log('Dealer ID code :', usercode);

        // if (isNaN(usercode)) {
        // console.log('Invalid code');
        // } else {
        // console.log('Dealer ID code :', usercode);
        // }
        
        const mailOptions = {
            from: 'traveloindia01@gmail.com',
            to: data.dealerid,
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
        res.render('dealer',{verificationCode:true,email:detailsArray[0]})
    }
    else{
        res.render('dealer',{fpassword:true,warning:true})
    }
})


const verify_code = (async(req,res)=>{
    let code_string = req.body.index0+""+req.body.index1+""+req.body.index2+""+req.body.index3+""+req.body.index4;
    let enterCode = parseInt(code_string, 10);
    if(usercode ===enterCode){
        res.render('dealer',{changepwd:true,email:detailsArray[0]})
        console.log("dealer verifcation:"+detailsArray[0]);
    }
    else{
        console.log("Invalid");
        console.log("dealer verifcation:"+detailsArray[0]);
        res.render('dealer',{verificationCode:true,invalid:true,emailid:detailsArray[0]})
    }
})

const changePassword =(async(req,res)=>{
    if(req.body.cpwd === req.body.rpwd){
        detailsArray[0]=req.body.dealerid;
        console.log("changepassword:"+detailsArray[0]);
        const hashedpassword = await bcrypt.hash(req.body.rpwd, 10);
        req.body.rpwd = hashedpassword.toString();
        const newvalues ={$set:{password:req.body.rpwd}};
        const filter = {dealerid: req.body.dealerid}
        const options = { upsert: false };           
        await validation.updateOne(filter,newvalues,options, (err , collection) => {
            if(err){
                console.log('error'+err)
            }
            else{
                console.log("User Password Updated Successfully");
            }
        })
        res.redirect('/dealer');
    }
    else{
        console.log("changepassword:"+detailsArray[0]);
        console.log("password not matched");
        res.render('dealer',{changepwd:true,email:detailsArray[0],invalid:true})

    }
})

function dealermail() {
    return detailsArray;
}

module.exports = {
    dealerlogin,
    dealermail,
    dealerbus,
    fpass_nodemail,
    verify_code,
    changePassword
};