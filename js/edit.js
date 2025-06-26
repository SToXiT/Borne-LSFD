if (!sessionStorage.getItem('editor')) {
  window.location.href = "login.html";
}

async function loadHydrants() {
  const response = await fetch('hydrants.json');
  return await response.json();
}

function saveHydrantsLocally(hydrants) {
  localStorage.setItem('hydrants', JSON.stringify(hydrants));
}

function getLocalHydrants() {
  const local = localStorage.getItem('hydrants');
  return local ? JSON.parse(local) : null;
}

// Icônes personnalisées, anchor centrée en bas pour pointer exactement sous le curseur
const markerIcons = {
  "hydrant-red": L.icon({ iconUrl: 'img/marker-red.png', iconSize: [10,10], iconAnchor: [5,5] }),
  "hydrant-yellow": L.icon({ iconUrl: 'img/marker-yellow.png', iconSize: [10,10], iconAnchor: [5,5] }),
  "firestation": L.icon({ iconUrl: 'img/marker-firestation.png', iconSize: [20,32], iconAnchor: [10,32] }),
  "hospital": L.icon({ iconUrl: 'img/marker-hospital.png', iconSize: [20,32], iconAnchor: [10,32] }),
};

const markerLabels = {
  "hydrant-red": "Borne rouge",
  "hydrant-yellow": "Borne jaune",
  "firestation": "Caserne",
  "hospital": "Hôpital"
};

let selectedType = "hydrant-red";
document.querySelectorAll('#marker-type-selector button').forEach(btn => {
  btn.onclick = () => {
    selectedType = btn.getAttribute('data-type');
    document.getElementById('map').classList.add('crosshair-cursor');
  }
});

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2
});
const bounds = [[0,0], [9000,8192]];
L.imageOverlay('img/map.png', bounds).addTo(map);
map.fitBounds(bounds);

let hydrants = [];
let markers = [];

function renderHydrants() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  hydrants.forEach((h, idx) => {
    const icon = markerIcons[h.type] || markerIcons["hydrant-red"];
    const label = markerLabels[h.type] || h.type;
    const marker = L.marker([h.y, h.x], {icon})
      .bindPopup(label)
      .addTo(map);
    marker.on('click', () => {
      if (confirm(`Supprimer ce marqueur (${label}) ?`)) {
        hydrants.splice(idx, 1);
        saveHydrantsLocally(hydrants);
        renderHydrants();
        //alert("⚠️ Pense à copier le JSON et à mettre à jour hydrants.json sur le serveur !");
      }
    });
    markers.push(marker);
  });
}

// Ajout du marqueur sur clic
map.on('click', function(e) {
  hydrants.push({ x: e.latlng.lng, y: e.latlng.lat, type: selectedType });
  saveHydrantsLocally(hydrants);
  renderHydrants();
  //alert("⚠️ Pense à copier le JSON et à mettre à jour hydrants.json sur le serveur !");
});

// Copie du JSON
document.getElementById('copy-json-btn').onclick = function() {
  navigator.clipboard.writeText(JSON.stringify(hydrants, null, 2));
  alert("JSON copié dans le presse-papiers !");
};

async function init() {
  hydrants = getLocalHydrants() || await loadHydrants();
  renderHydrants();
}
init();

function logout() {
  sessionStorage.removeItem('editor');
  window.location.href = "index.html";
}
