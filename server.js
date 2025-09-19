const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Serve static frontend files from "public"
app.use(express.static('public'));

// GraphQL API endpoint
const url = 'https://emma.mav.hu//otp2-backend/otp/routers/default/index/graphql';

// GraphQL query
const query = `
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
`;

// Variable to store latest data in memory
let latestData = null;

// Function to fetch latest vehicle positions
async function fetchLatestData() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    latestData = data;
    console.log(`[${new Date().toISOString()}] Updated vehicle positions`);
  } catch (err) {
    console.error('Error fetching vehicle positions:', err);
  }
}

// Fetch immediately on startup
fetchLatestData();

// Refresh every 60 seconds
setInterval(fetchLatestData, 60 * 1000);

// API endpoint for frontend
app.get('/api/timetables', (req, res) => {
  if (latestData) {
    res.json(latestData);
  } else {
    res.status(503).json({ error: 'Data not available yet' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});