const validation = require('../src/dealerdb')
const bcrypt = require('bcrypt')

let detailsArray=[];

const dealerlogin = async(req,res)=>{
    validation.findOne({dealerid : req.body.dealerid}).then(async(data)=>{
        if(data){
            detailsArray[0]=data.dealerid;
            const validpassword = await bcrypt.compare(req.body.password,data.password)
            if(validpassword){
                res.render('dealerHome',{dealerprofile:true})
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

function dealermail() {
    return detailsArray;
}

module.exports = {dealerlogin,dealermail};