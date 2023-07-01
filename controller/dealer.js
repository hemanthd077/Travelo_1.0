const validation = require('../src/dealerdb')
const bcrypt = require('bcrypt')
const busdetails = require('../src/busDetails')


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
                res.status(400).render('dealer',{'res':'Invalid Password','control':true})
            }
        }
        else{
            res.status(400).render('dealer',{'res':'Dealer-Id does not Exist','control':true});
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



function dealermail() {
    return detailsArray;
}

module.exports = {
    dealerlogin,
    dealermail,
    dealerbus,
};