const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')

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

            const hashedpassword = await bcrypt.hash(body.password, 10);
            body.password = hashedpassword.toString();
            body.profileimage

            validation.insertMany([body])
        
            res.render('login')            
        }
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = signup;

