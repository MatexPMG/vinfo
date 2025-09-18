let locoData = {};

fetch('json/locos.json')
  .then(res => res.json())
  .then(data => {
    locoData = data;
  }
);

function uicC(uic) {
  return uic.toString().substring(5, 8);
}

function locoInfo(train) {
  const panel = document.getElementById('loco-info');
  panel.style.display = 'block';

  const rawUIC = train.vehicleId.split(':')[1];
  const series = uicC(rawUIC);
  const loco = locoData[series];

  function uicF(uic) {
    if (!uic || uic.length < 12) return uic;
    return `${uic.slice(0,2)} ${uic.slice(2,4)} ${uic.slice(4,8)} ${uic.slice(8,11)}-${uic.slice(11)}`;
  }
  const formattedUIC = uicF(rawUIC);

  const speed = Math.round(train.speed * 3.6) || '0';
  const nick = loco?.nick || '-';
  const manufacturer = loco?.manufacturer || '-';
  const production = loco?.production || '-';
  const vmax = loco?.vmax || '-';
  const power = loco?.power || '-';
  const UIC = train.vehicleId.split(':')[1];
  const locNum = `${UIC.slice(5,8)} ${UIC.slice(8,11)}`;  

  const imgSrc = `img/vehicles/series/${series}/${locNum}.png`;
  const FBCKimgSrc = `img/vehicles/${series}.png`;


  panel.innerHTML = `
    <h2>Vontatójármű</h2>

    <img src="${imgSrc}" alt="${series}" id="locoIMG" onerror="this.onerror=null; this.src='${FBCKimgSrc}';" />

    <p>${formattedUIC}</p>
    
    <table>
      <tr><td>Sebesség:</td><td>${speed} km/h</td></tr>
      <tr class="odd"><td>Engedélyezett sebesség:</td><td>${vmax} km/h</td></tr>
      <tr><td>Becenév:</td><td>${nick}</td></tr>
      <tr class="odd"><td>Gyártó:</td><td>${manufacturer}</td></tr>
      <tr><td>Gyártásban:</td><td>${production}</td></tr>
      <tr class="odd"><td>Teljesítmény:</td><td>${power}</td></tr>
    </table>
  `;
}