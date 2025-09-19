const express = require('express');
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

// store the cached data
let cachedData = null;

// function to update cached data
async function fetchData() {
  try {
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TIMES)
    });

    if (!apiRes.ok) throw new Error(`HTTP error ${apiRes.status}`);

    cachedData = await apiRes.json();
    console.log('✅ Updated timetable cache at', new Date().toISOString());
  } catch (err) {
    console.error('TIMES Request error:', err);
  }
}

// update every 60 sec
setInterval(fetchData, 60 * 1000);
// run immediately on startup too
fetchData();

// endpoint to serve cached data
app.get('/json/timetables.json', (req, res) => {
  if (cachedData) {
    res.json(cachedData);
  } else {
    res.status(503).json({ error: 'No data available yet' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚂 Server running on port ${port}`);
});