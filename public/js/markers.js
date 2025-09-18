function markers() {
    fetch('https://vinfo-production.up.railway.app/json/timetables.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        trainLayer.clearLayers();
        
        const trains = data.vehiclePositions || data.data?.vehiclePositions;
        //const now = Math.floor(Date.now() / 1000);
        //const cutoff = now - (30 * 60);

        trains.forEach(train => {
          if (true) {
            const delay = Math.round(train.nextStop?.arrivalDelay / 60);
            const lat = train.lat;
            const lon = train.lon;
            const heading = train.heading;
            const speed = Math.round(train.speed * 3.6);
            const name = train.trip?.tripShortName || '';
            const dest = train.trip?.tripHeadsign || '';
            const UIC = train.vehicleId.split(':')[1];
            const loc = `${UIC.slice(5,8)} ${UIC.slice(8,11)}`;
            const searchId = `${name} | ${loc}`;

            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    html: `
                    <div class="train-marker">
                      <div class="circle" style="
                      background-color: ${delCol(delay)};
                    "></div>
                    ${speed > 0 ? `
                      <div class="arrow" style="
                        transform: translate(-50%, -50%) rotate(${heading}deg) translateY(-10px);
                      "></div>
                        ` : ''}
                      </div>
                    `,
                    className: "marker",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                }),
            });
            trainMarkers.set(searchId, marker);

            marker.on('click', () => {
                selectedTrainId = train.vehicleId;
                TTupdate(train);
                locoInfo(train);
                if (window.activeRoute) {
                  map.removeLayer(window.activeRoute);
                }

                window.activeRoute = poly(train.trip.tripGeometry, map);

                if (selectedTrainId === train.vehicleId) {
                if (selected) {
                    selected.setLatLng([lat, lon]);
                } else {
                    selected = L.circleMarker([lat, lon], {
                    radius: 20,
                    color: 'aqua',
                    fillColor: 'aqua',
                    fillOpacity: 0.75,
                    weight: 0
                    }).addTo(map);
                }
            }});

            map.on('click', function (e) {
                if (selected) {
                 map.removeLayer(selected);
                 selected = null;
                }
             selectedTrainId = null;

             document.getElementById("train-info").style.display = "none";
             document.getElementById("loco-info").style.display = "none";

             if (trainInfoUpdater) {
             clearTimeout(trainInfoUpdater);
             clearInterval(trainInfoUpdater);
             trainInfoUpdater = null;
             }

             if (window.activeRoute) {
              map.removeLayer(window.activeRoute);
             }
            });

            const popupContent = `
            <div class="custom-popup">
            <b>${name} &rarr;</b> ${dest} <i>${delay > 0 ? '+' + delay : delay}</i>
            </div>
            `;

            const popup = L.popup({
                className: 'custom-popup',
                closeButton: false,
                autoPan: false,
                maxWidth: 600
            }).setContent(popupContent);

            marker.on('mouseover', function () {
                marker.bindPopup(popup).openPopup();
            });
            marker.on('mouseout', function () {
                marker.closePopup();
            });

            trainLayer.addLayer(marker);

            if (selectedTrainId === train.vehicleId && selected) {
                selected.setLatLng([lat, lon]);
            }
        }});
    });
}

function delCol(delay) {
  if (delay <= 5) return 'rgb(59, 233, 42)';
  if (delay <= 19) return 'rgb(251, 255, 0)';
  if (delay <= 59) return 'rgb(255, 165, 0)';
  if (delay >= 60) return 'rgb(255, 0, 17)';
  return 'rgb(59, 233, 42)';
}

markers();
setInterval(markers, 60000)