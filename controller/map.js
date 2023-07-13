const axios = require('axios');


const options = {
    method: 'GET',
    url: 'https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix',
    params: {
      origins: '13.067439,80.237617;',
      destinations: '11.00456,76.961632'
    },
    headers: {
      'X-RapidAPI-Key': 'd849f031bfmshb956c3a613f59b6p166679jsna7a2bb5e751e',
      'X-RapidAPI-Host': 'trueway-matrix.p.rapidapi.com'
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
 