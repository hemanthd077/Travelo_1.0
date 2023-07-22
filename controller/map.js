const axios = require('axios');

require('dotenv').config();
const X_RapidAPI_Key = process.env.X_RAPIDAPI_KEY
const X_RapidAPI_Host = process.env.X_RAPIDAPI_HOST

const options = {
    method: 'GET',
    url: 'https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix',
    params: {
      origins: '13.067439,80.237617;',
      destinations: '11.00456,76.961632'
    },
    headers: {
      'X-RapidAPI-Key': X_RapidAPI_Key,
      'X-RapidAPI-Host': X_RapidAPI_Host
    }
  };

function secondsToHours(seconds) {
    const hours = Math.floor(seconds / 3600); 
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    return `${hours} hours ${minutes} minutes`;
}

 const map = async(req,res)=>{
      try {
          const response = await axios.request(options);
          distance = Math.ceil(response.data.distances[0][0]/1000);
          time = secondsToHours(response.data.durations[0][0]);
          console.log(distance+"Km  "+time);
      } catch (error) {
          console.error(error);
      }
      res.redirect('/');
 }


 module.exports = {
    map
  };
 