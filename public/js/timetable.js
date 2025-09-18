let trainInfoUpdater = null;

function TTupdate(train) {
  if (trainInfoUpdater) {
    clearTimeout(trainInfoUpdater);
    clearInterval(trainInfoUpdater);
    trainInfoUpdater = null;
  }

  showTrainInfo(train);

  function scheduleNextMinute() {
    const now = new Date();
    const msToNextMinute = (63 - now.getSeconds()) * 1000 - now.getMilliseconds();

    trainInfoUpdater = setTimeout(() => {
      showTrainInfo(train);
      trainInfoUpdater = setInterval(() => showTrainInfo(train), 60000);
    }, msToNextMinute);
  }
  scheduleNextMinute();
}

function showTrainInfo(train) {
  const container = document.getElementById('train-info');
  container.style.display = 'block';

  const name = train.trip?.tripShortName || 'Unknown';
  const dest = train.trip?.tripHeadsign || 'Unknown';
  const delay = Math.round(train.nextStop?.arrivalDelay / 60);
  const delayHTML = delay > 0 ? `<h2>A pillanatnyi késés ${delay} perc</h2>`: '';
  const alert = train.trip.alerts?.[0]?.alertDescriptionText || null;
  const alertHTML = alert ? `<h3>${alert}</h3>` : '';

  const now = new Date();
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let lastPassedIndex = 0;

  const rows = train.trip.stoptimes.map((stop, i) => {
    const schedArr = formatTime(stop.scheduledArrival);
    const schedDep = formatTime(stop.scheduledDeparture);
    const realArr = stop.arrivalDelay
      ? formatTime(stop.scheduledArrival + stop.arrivalDelay)
      : schedArr;
    const realDep = stop.departureDelay
      ? formatTime(stop.scheduledDeparture + stop.departureDelay)
      : schedDep;
    let arrClass = "ontime";
    if (stop.arrivalDelay < 0) arrClass = "early";
    else if (stop.arrivalDelay > 0) arrClass = "delayed";

    let depClass = "ontime";
    if (stop.departureDelay < 0) depClass = "early";
    else if (stop.departureDelay > 0) depClass = "delayed";

    const depTimeSec = stop.scheduledDeparture + (stop.departureDelay || 0);
    const rowClass = depTimeSec < nowSec
    ? (i % 2 === 0 ? "past even" : "past odd")
    : (i % 2 === 0 ? "future even" : "future odd");

    if (depTimeSec < nowSec) {
      lastPassedIndex = i;
    }

    return `
      <tr class="${rowClass}" id="station-row-${i}">
        <td id="stationN" rowspan="2">${stop.stop.name}</td>
        <td id="SchArr">${schedArr}</td>
        <td id="SchDep">${schedDep}</td>
        <td id="platformN" rowspan="2">${stop.stop.platformCode || '-'}</td>
      </tr>
      <tr class="${rowClass}">
        <td class="real ${arrClass}">${realArr}</td>
        <td class="real ${depClass}">${realDep}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
  <div class="timetable">
    <h1>
      ${name}
    </h1>
    <h6>
      → ${dest}
    </h6>
    ${delayHTML}
    ${alertHTML}
    <div class="tbody-container">
      <table>
        <thead>
          <tr>
            <th class="all">Állomás</th>
            <th class="erk">Érkezés</th>
            <th class="ind">Indulás</th>
            <th class="vg">Vágány</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </div>
  `;

  const lastRow = document.getElementById(`station-row-${lastPassedIndex}`);
  if (lastRow) {
    lastRow.scrollIntoView({ block: "center"});
  }
}

function formatTime(seconds) {
  const d = new Date(0);
  d.setSeconds(seconds);
  return d.toISOString().substr(11, 5); 
}