if (!sessionStorage.getItem('editor')) {
  window.location.href = "login.html";
}

async function loadHydrants() {
  const response = await fetch('hydrant.json');
  return await response.json();
}

function saveHydrantsLocally(hydrants) {
  localStorage.setItem('hydrants', JSON.stringify(hydrants));
}

function getLocalHydrants() {
  const local = localStorage.getItem('hydrants');
  return local ? JSON.parse(local) : null;
}

// Icônes personnalisées (mêmes noms et fichiers que map.js)
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

let selectedType = "hydrant-red";
let visibleTypes = {};

document.querySelectorAll('#marker-type-selector button').forEach(btn => {
  btn.onclick = () => {
    selectedType = btn.getAttribute('data-type');
    document.getElementById('map').classList.add('crosshair-cursor');
  };
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
    if (visibleTypes[h.type] !== false) {
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
        }
      });
      markers.push(marker);
    }
  });
}

// Ajout du marqueur sur clic
map.on('click', function(e) {
  hydrants.push({ x: e.latlng.lng, y: e.latlng.lat, type: selectedType });
  saveHydrantsLocally(hydrants);
  renderHydrants();
});

// Copie du JSON
document.getElementById('copy-json-btn').onclick = function() {
  navigator.clipboard.writeText(JSON.stringify(hydrants, null, 2));
  alert("JSON copié dans le presse-papiers !");
};

// Bouton "Importer un JSON"
document.getElementById('import-json-btn').onclick = function() {
  document.getElementById('import-json-file').click();
};

document.getElementById('import-json-file').onchange = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Format JSON invalide");
      hydrants = imported;
      saveHydrantsLocally(hydrants);
      renderHydrants();
      alert("Importation réussie !");
    } catch (err) {
      alert("Erreur lors de l'import : " + err.message);
    }
  };
  reader.readAsText(file);
};

// Bouton "Vider les points locaux"
document.getElementById('clear-json-btn').onclick = function() {
  if (confirm("Voulez-vous vraiment supprimer tous les points enregistrés localement ?")) {
    hydrants = [];
    saveHydrantsLocally(hydrants);
    renderHydrants();
    alert("Tous les points locaux ont été supprimés.");
  }
};

// Menu de filtrage des types de marqueurs
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

async function init() {
  hydrants = getLocalHydrants();
  if (!hydrants || hydrants.length === 0) {
    hydrants = await loadHydrants();
    saveHydrantsLocally(hydrants); // Optionnel : pour uniformiser le stockage
  }
  console.log("Hydrants chargés :", hydrants);
  const types = [...new Set(hydrants.map(h => h.type))];
  types.forEach(type => visibleTypes[type] = true);
  createTypeMenu(types);
  renderHydrants();
}


init();

function logout() {
  sessionStorage.removeItem('editor');
  window.location.href = "index.html";
}
