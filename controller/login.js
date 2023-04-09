const validation = require('../src/mongodb')
const bcrypt = require('bcrypt')

let Email;

const login = async(req,res)=>{
    validation.findOne({Email : req.body.Email}).then(async(data)=>{
        if(data){
            const validpassword = await bcrypt.compare(req.body.password,data.password)
            if(validpassword){
                res.render('home')
            }
            else{
                res.status(400).render('login',{'res':'Invalid Password','contril':true})
            }
        }
        else{
            res.status(400).render('login',{'res':'User does not Exist','control':true});
        }
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = login;


