const validation = require('../src/dealerdb')
const bcrypt = require('bcrypt')

const dealerlogin = async(req,res)=>{
    validation.findOne({dealerid : req.body.dealerid}).then(async(data)=>{
        if(data){
            const validpassword = await bcrypt.compare(req.body.password,data.password)
            if(validpassword){
                res.render('dealerHome')
            }
            else{
                res.status(400).render('dealer',{'res':'Invalid Password','control':true})
            }
        }
        else{
            res.status(400).render('dealer',{'res':'User does not Exist','control':true});
        }
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = dealerlogin;