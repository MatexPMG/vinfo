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

// Simple in-memory cache (60s)
let cache = null;
let lastFetch = 0;

// Endpoint to serve timetables
app.get('/json/timetables.json', async (req, res) => {
  const now = Date.now();
  if (cache && now - lastFetch < 60000) {
    return res.json(cache);
  }

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

    const data = await apiRes.json();
    cache = data;
    lastFetch = now;
    res.json(data);
  } catch (err) {
    console.error('TIMES Request error:', err);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});