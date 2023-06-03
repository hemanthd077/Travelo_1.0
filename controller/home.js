const plandetails = require('../src/planDetails')
const busdetails = require('../src/busDetails')

function casedetective(a){
    let capFirstLetter = a[0].toUpperCase();
    let restOfGreeting = a.slice(1).toLowerCase();
    return newGreeting = capFirstLetter + restOfGreeting; 
}


let buscontent = [];
let busnamearr = [];

const getin = async(req,res)=>{
    const data = await plandetails.find({city:req.body.destination})
    if(data.length>0){
        
        for (let ind = 0; ind < data.length; ind++) {
            const busdata = await busdetails.find({busname:data[ind].busname})
            let temp = [];
            let i=0;
            if(busdata.length>0){
                temp[i++] = data[ind].busname.toUpperCase();
                temp[i++] = casedetective(req.body.source);
                busnamearr[ind] = data[ind].busname;
                temp[i++] = casedetective(data[ind].city);
                temp[i++] = busdata[0].seatcount;
                buscontent[ind]=temp;
            }
        }
        const state = buscontent.length===0;
        if(state)
            return res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true})
        let ts = Date.now();

        let date_time = new Date(ts);
        let date = (date_time.getDate()+"").padStart(2,"0");
        let month = (date_time.getMonth() + 1+"").padStart(2, "0");
        let year = (date_time.getFullYear()+"").padStart(4,"0");
        const currentdate = year+"-"+month+"-"+date 

        console.log('date:'+currentdate);
        console.log('userdate:'+req.body.date);
        const datearr = (req.body.date).split("-"); 

        if(datearr[0] > year &&  datearr[2] > date){
            res.render('home',{result:true,buscontent,'city':data.city,'currentdate':currentdate,searchresult:true})
        }
        else if(year==year){
            if(datearr[1]>month){
                res.render('home',{result:true,buscontent,'city':data.city,currentdate,searchresult:true})
            }
            else if(datearr[1]==month && datearr[2]>date){
                res.render('home',{result:true,buscontent,'city':data.city,currentdate,searchresult:true})
            }
            else{
                res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true})
            }
        }
        else{
            res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true})
        }
    }
    else{
        res.render('home',{'res':'No Buses Avaliable',error:true,searchresult:true})
    }
}

const getImg = async(req,res)=>{
    let imagecontent = [];
    const data1 = await busdetails.find({busname:busnamearr[req.body.busid]})
    if(data1.length>0){
        for (let index = 0; index < data1.length; index++) {
            imagecontent[index] = data1[index].busimage.ContentType+";base64,"+data1[index].busimage.data.toString('base64');
        }
    } 
    res.render('home',{searchresult:true,image:true,imagecontent});
}

module.exports = {
    getin,
    getImg,
}