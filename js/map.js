// Icônes personnalisées
const markerIcons = {
  "hydrant-red": L.icon({ iconUrl: 'img/marker-red.png', iconSize: [10,10], iconAnchor: [5,5] }),
  "hydrant-yellow": L.icon({ iconUrl: 'img/marker-yellow.png', iconSize: [10,10], iconAnchor: [5,5] }),
  "firestation": L.icon({ iconUrl: 'img/marker-firestation.png', iconSize: [10,10], iconAnchor: [5,5] }),
  "hospital": L.icon({ iconUrl: 'img/marker-hospital.png', iconSize: [10,10], iconAnchor: [5,5] }),
};

const markerLabels = {
  "hydrant-red": "Borne rouge",
  "hydrant-yellow": "Borne jaune",
  "firestation": "Caserne",
  "hospital": "Hôpital"
};

let hydrants = [];
let markers = [];
let visibleTypes = {};

// Affiche les marqueurs selon les types cochés
function renderHydrants() {
  markers.forEach(m => m.remove());
  markers = [];
  hydrants.forEach(h => {
    if (visibleTypes[h.type] !== false) {
      const icon = markerIcons[h.type] || markerIcons["hydrant-red"];
      const label = markerLabels[h.type] || h.type;
      const marker = L.marker([h.y, h.x], {icon})
        .bindPopup(label)
        .addTo(map);
      markers.push(marker);
    }
  });
}

// Crée le menu de sélection des types dans le div existant
function createTypeMenu(types) {
  const menu = document.getElementById('type-menu');
  menu.innerHTML = `<strong>Types à afficher :</strong><br>`;
  types.forEach(type => {
    const checked = visibleTypes[type] !== false ? 'checked' : '';
    const label = markerLabels[type] || type;
    menu.innerHTML += `
      <label>
        <input type="checkbox" data-type="${type}" ${checked}>
        ${label}
      </label><br>
    `;
  });
  // Ajoute l'événement pour chaque checkbox
  menu.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', function() {
      visibleTypes[this.getAttribute('data-type')] = this.checked;
      renderHydrants();
    });
  });
}

// Chargement des données JSON puis initialisation
async function initMap() {
  const response = await fetch('hydrant.json');
  hydrants = await response.json();
  // Liste unique des types présents dans le JSON
  const types = [...new Set(hydrants.map(h => h.type))];
  types.forEach(type => visibleTypes[type] = true);
  createTypeMenu(types);
  renderHydrants();
}

// Initialisation de la carte
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -4,
  maxZoom: 2
});
const bounds = [[0,0], [9000,8192]];
L.imageOverlay('img/map.png', bounds).addTo(map);
map.fitBounds(bounds);

initMap();
