const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static('public'));

// GraphQL API URL and query
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

// Function to fetch and save timetables.json
async function timetables() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'access-control-allow-origin': 'https://emma.mav.hu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TIMES)
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.text(); // text because you want raw response
    const size = Buffer.byteLength(data, 'utf8') / 1000;

    fs.writeFile('public/json/timetables.json', data, err => {
      if (err) console.error('timetables write ERROR:', err);
      else console.log(`timetables OK, downloaded ${size} kB`);
    });
  } catch (err) {
    console.error('TIMES Request error:', err);
  }
}

// Initial fetch + interval every minute
timetables();
setInterval(timetables, 60000);

// Start server
app.listen(port, () => {
  console.log(`Server OK on port ${port}`);
});