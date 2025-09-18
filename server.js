const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server OK`);
});

//lekerdezes
const fs = require('fs');
const fetch = require('node-fetch');

const url = 'https://emma.mav.hu//otp2-backend/otp/routers/default/index/graphql';

const TIMES = {
query: `
{
  vehiclePositions(
    swLat: 45.74573822516341,
    swLon: 16.21031899279769,
    neLat: 48.56368661139524,
    neLon: 22.906741803509043,
    modes: [RAIL, TRAMTRAIN]
  ) {
    vehicleId
    lat
    lon
    heading
    speed
    lastUpdated
    nextStop {
      arrivalDelay
    }
    trip {
      alerts(types: [ROUTE, TRIP]) {
        alertDescriptionText
      }

      tripShortName
      tripHeadsign

      stoptimes {
        stop {
          name
          lat
          lon
          platformCode
        }
        scheduledArrival
        arrivalDelay
        scheduledDeparture
        departureDelay
      }
      tripGeometry {
        points
      }
    }
  }
}
`,
variables: {}
};

function timetables() {

  fetch(url, {
  method: 'POST',
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'access-control-allow-origin': 'https://emma.mav.hu',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(TIMES)
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.text();
    })
    .then(text => {
      const size = (Buffer.byteLength(text, 'utf8'))/1000;
      const data = JSON.parse(text);

      fs.writeFile('public/json/timetables.json', JSON.stringify(data, null, 2), err => {
        if (err) {
          console.error('timetables write ERROR:', err);
        } else {
          console.log(`timetables OK, downloaded ${size} kB`);
        }
      });
    })
    .catch(err => {
      console.error('TIMES Request error:', err);
    });
}

timetables();
setInterval(timetables, 60000);