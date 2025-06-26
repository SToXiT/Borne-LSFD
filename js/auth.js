// Liste des éditeurs (login/mot de passe)
const editors = [
  { username: "admin", password: "motdepasse1" },
  { username: "bob", password: "motdepasse2" }
  // Ajoute ici tes autres utilisateurs
];

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const found = editors.find(e => e.username === username && e.password === password);
  if (found) {
    sessionStorage.setItem('editor', username);
    window.location.href = "edit.html";
  } else {
    document.getElementById('errorMsg').innerText = "Identifiants incorrects";
  }
  return false;
}
