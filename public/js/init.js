let map;
let selected = null;
let trainLayer;

let selectedTrainId = null;
const trainMarkers = new Map();
const searchInput = document.getElementById('trainSearch');
const suggestionsBox = document.getElementById('suggestions');

function init() {
    map = L.map('map', {
        center: [47.18, 19.5],
        zoom: 8,
        minZoom: 6,
        fadeAnimation: false,
        maxBounds: [
            [42.18, 4.5],
            [52.18, 34.5]
        ],
        maxBoundsViscosity: 0.5
    });

    map.zoomControl.setPosition('bottomright');

    L.tileLayer.grayscale('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        attribution: 'rendering CC-BY-SA OpenRailwayMap'
    }).addTo(map);

    L.control.scale({'metric':true,'imperial':false}).addTo(map);

    trainLayer = L.layerGroup().addTo(map);
}

init();