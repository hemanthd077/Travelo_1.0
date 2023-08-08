const async = require('hbs/lib/async');
const userDb = require('../src/mongodb');
const Login = require('../controller/login');
const busdb = require('../src/busDetails');
const dealerdetails = require('../src/dealerdb');
const plandetails = require('../src/planDetails')

const detailsArray = Login.mail();


const likebuses = (async(req,res)=>{
    let busdataarr = [];
    await userDb.findOne({Email:detailsArray[2]}).then(async(data)=>{
        if(data){
            if(data.likedbus.length){
                for(let i =0;i<data.likedbus.length;i++){
                    if(data.likedbus[i].busid){
                        let busdata = await busdb.findOne({id:data.likedbus[i].busid})
                        temp = [];
                        if(busdata){
                            const dealerdata = await dealerdetails.findOne({dealerid:busdata.dealerid})
                            temp[0] = dealerdata.profileimage.ContentType+";base64,"+dealerdata.profileimage.data.toString('base64');
                            temp[2] =  dealerdata.dealername;
                        }
                        temp[1] = busdata.busname;
                        temp[3] = busdata.seatcount
                        let plandata = await plandetails.find({id:data.likedbus[i].busid})
                        let dummy = [];
                        if(plandata){
                            let mySet = new Set();
                            for(let x=0;x<plandata.length;x++){
                                for(let y=0;y<plandata[x].dayplans.length;y++){
                                    mySet.add(plandata[x].dayplans[y].mainspot);
                                }
                            }
                            let ind=0;
                            for (let item of mySet) {
                                dummy[ind++] = item;
                            }    
                        }
                        temp[4] = dummy;
                        if(busdata.musicsystem==='yes'){
                            temp[5]=true;
                        }
                        else{
                            temp[5]=false;
                        }
                        if(busdata.acornonac==='ac'){
                            temp[6]=true;
                        }
                        else{
                            temp[6]=false;
                        }
                        if(busdata.seattype==='seater'){
                            temp[7]=true;
                        }
                        else{
                            temp[7]=false;
                        }
                        if(busdata.lighting==='yes'){
                            temp[8]=true;
                        }
                        else{
                            temp[8]=false;
                        }
                        if(busdata.waterfilter==='yes'){
                            temp[9]=true;
                        }
                        else{
                            temp[9]=false;
                        }
                        if(busdata.busimage){
                            temp[10] = busdata.busimage[0].ContentType+";base64,"+busdata.busimage[0].data.toString('base64');
                        }
                        busdataarr[i] = temp
                    }
                }
                res.render('likes',{busdataarr,'length':busdataarr.length})
            }
            else{
                res.render('likes',{'warning':true});
            }
        }
        else{
            res.render('404');
            console.log("User data Not Found");
        }
    })
})

module.exports = {
    likebuses,
}