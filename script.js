const toutesLesPhrases = [
`Le {nom} a été terrassé !`,
`Tu as vaincu le {nom} !`,
`Le {nom} s'incline devant ta force.`,
`Victoire contre le {nom} !`,
`Le {nom} est tombé sous tes attaques.`,
`Le {nom} n'était pas de taille !`,
`Tu as écrasé le {nom} !`,
`Le {nom} a fui avant de tomber.`,
`Ton courage a triomphé du {nom}.`,
`Le {nom} est désormais une légende... vaincue.`,
`Sous tes coups, le {nom} s'effondre.`,
`Le {nom} n'a pas résisté longtemps.`,
`La puissance du héros a terrassé le {nom} !`,
`Ton épée a mis fin aux jours du {nom}.`,
`Le {nom} est tombé dans l'oubli.`,
`Ton bras a été plus fort que le {nom}.`,
`Un coup fatal pour le {nom} !`,
`Le {nom} a mordu la poussière.`,
`Le {nom} hurle une dernière fois avant de s'effondrer.`,
`L'honneur du {nom} n'a pas suffi.`,
`Le {nom} a été balayé par ta puissance.`,
`Le combat contre le {nom} est terminé, victoire !`,
`Ton triomphe sur le {nom} est total.`,
`Le {nom} n'était qu'un obstacle de plus.`,
`Un de plus ! Le {nom} est tombé sous ta lame.`
];

const texteRegles = 
["Les Règles du Donjon :\n\n" +
"- Pour battre un monstre vous devez relevez le défi.\n" +
"- Vous pouvez alterner entre les armes que vous avez. \n" +
"- Chaque victoire rapporte 1 ou 2 équipements.\n" +
"- Esquiver un monstre coûte 100 jumping jacks supplémentaires par esquive.\n" +
"- Un objet est retiré de votre inventaire à chaque esquive.\n" +
"- Vous pouvez utiliser un bonus une seule fois par combat.\n" +
"- Les boss ont des règles spéciales (Résurrection, Titan 2000 PV).\n" +
"- Battre le boss final vous fait devenir Champion !"];

let monstres = [];
let monstres_spe = [];
let boss = [];
let objets = [];
let exercices = [];
let inventaire = [];
let paquetRencontres = [];
let nombreEsquives = 0;
let historiqueMonstres = [];
let phrasesDisponibles = [];
let bonusActifs = {
  double_attaque: false,
  ignorer_defis: false
};
let debutChrono;
let intervalChrono;

// === Récupération des données === //
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    monstres = data.monstres;
    monstres_spe = data.monstres_spe;
    boss = data.boss;
    objets = data.objets;
    exercices = data.exercices;

    phrasesDisponibles = [...toutesLesPhrases];

  
    demarrerJeu();
  })
  .catch(error => {
    console.error("Erreur de chargement du data.json :", error);
    alert("Impossible de charger les données du jeu !");
  });


function demarrerJeu() {
  piocherEquipement();
  creerPaquet();
  afficherRencontre();
  demarrerChrono();
}

function ajouterAnimation(id, animation) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove(animation);
  void el.offsetWidth; // ➜ force reflow
  el.classList.add(animation);

  setTimeout(() => el.classList.remove(animation), 500); // 500ms suffit
}

function piocherEquipement() {
if (objets.length < 2) return alert("Pas assez d'objets !");

let indices = [];
let tentative = 0;

do {
  indices = [];
  while (indices.length < 2) {
    const randIndex = Math.floor(Math.random() * objets.length);
    if (!indices.includes(randIndex)) indices.push(randIndex);
  }

  tentative++;
  if (tentative > 10) break;

  // Vérifier si au moins une arme
} while (!indices.some(i => objets[i].type === "arme"));

indices.sort((a, b) => b - a);
indices.forEach(index => {
  inventaire.push(objets[index]);
  objets.splice(index, 1);
});

afficherInventaire();
ajouterAnimation("liste-equipement", "flash");
}

function piocherEquipementSimple() {
if (objets.length === 0) return;
const randIndex = Math.floor(Math.random() * objets.length);
inventaire.push(objets[randIndex]);
objets.splice(randIndex, 1);
afficherInventaire();
ajouterAnimation("liste-equipement", "flash");
}

function afficherInventaire() {
const liste = document.getElementById("liste-equipement");
liste.innerHTML = "";
inventaire.forEach(objet => {
  const li = document.createElement("li");
  li.textContent = `${objet.nom} (${objet.type}) - ${objet.effet}`;
  liste.appendChild(li);
});
}

function piocherMonstres() {
const indices = [];
while (indices.length < 4) {
  const rand = Math.floor(Math.random() * monstres.length);
  if (!indices.includes(rand)) indices.push(rand);
}

let monstresChoisis = indices.map(i => monstres[i]);

if (Math.random() < 0.3) {
  const spe = monstres_spe[Math.floor(Math.random() * monstres_spe.length)];
  monstresChoisis[Math.floor(Math.random() * monstresChoisis.length)] = spe;
}

return monstresChoisis;
}

function piocherBoss() {
return boss[Math.floor(Math.random() * boss.length)];
}

function creerPaquet() {
const monstresChoisis = piocherMonstres();
const bossChoisi = piocherBoss();
paquetRencontres = [...monstresChoisis.sort(() => Math.random() - 0.5), bossChoisi];
totalCartes = paquetRencontres.length;
mettreAJourBarreProgression();
}

function afficherRencontre() {
  console.log("Deck actuel :", paquetRencontres);

  const monstreZone = document.getElementById("monstre-actuel");
  const defiZone = document.getElementById("defi-courant");

  monstreZone.innerHTML = "";
  defiZone.innerHTML = "";

  if (paquetRencontres.length === 0) {
    setTimeout(() => {
      if (confirm("🏆 Tu es Champion ! Bravo !\n\nCliquez sur OK pour recommencer.")) {
        location.reload();
      }
    }, 300);
    return;
  }

  const rencontre = paquetRencontres[0];

if (rencontre.special) {

  const monstreZone = document.getElementById("monstre-actuel");
  monstreZone.innerHTML = `
    <div>
      <h3>${rencontre.nom}</h3>
      <img src="${rencontre.image}" alt="${rencontre.nom}" width="80%">
      <p>Événement spécial en approche...</p>
    </div>
  `;
  ajouterAnimation("monstre-actuel", "fade-in");

  return;
}

  // Boss avec règle spéciale
if (rencontre.regle_speciale) {
  const regle = rencontre.regle_speciale;
  rencontre.regle_speciale = null;
  setTimeout(() => {
    appliquerRegleSpeciale(rencontre, regle);
  }, 300); // On attend un peu
  return;
}

  // Monstre classique
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>${rencontre.nom}</h3>
    <img src="${rencontre.image}" alt="${rencontre.nom}" width="80%">
    ${rencontre.pv ? `<p>PV: ${rencontre.pv}</p>` : ""}
    ${rencontre.defi ? `<p>Défi: ${rencontre.defi}</p>` : ""}`;
    monstreZone.appendChild(div);
    ajouterAnimation("monstre-actuel", "fade-in");
}

function effetMarchandMystere() {
  alert("Le Marchand te propose un choix...");

  // Sélectionner 2 objets différents aléatoires
  const propositions = [];
  while (propositions.length < 2 && objets.length > 0) {
    const index = Math.floor(Math.random() * objets.length);
    const objet = objets[index];
    if (!propositions.includes(objet)) propositions.push(objet);
  }

  const zone = document.getElementById("choix-marchand");
  zone.innerHTML = `<h3>Choisis ton équipement :</h3>`;

  propositions.forEach(objet => {
    const div = document.createElement("div");
    div.classList.add("carte");
    div.innerHTML = `
      <img src="${objet.image}" alt="${objet.nom}" width="50%"><br>
      <strong>${objet.nom}</strong><br>
      <em>${objet.type}</em><br>
      <small>${objet.effet}</small>
    `;
    div.onclick = () => {
      // Ajout à l'inventaire
      inventaire.push(objet);
      const index = objets.indexOf(objet);
      if (index !== -1) objets.splice(index, 1);
      afficherInventaire();
      ajouterAnimation("liste-equipement", "flash");
      zone.style.display = "none";
    };
    zone.appendChild(div);
  });

  zone.style.display = "block";
}

function effetMageBenevole() {
alert("Fait :\n\n2mins de Planche\n2mins de Squat\n\nLe Mage t'accorde un bonus supplémentaire !");
const bonus = objets.find(o => o.type === "bonus");
if (bonus) {
  inventaire.push(bonus);
  afficherInventaire();
  ajouterAnimation("liste-equipement", "flash");
}
}

function effetEspritCombat() {
  alert("Fait :\n\n200 Jumping Jack\n50 High Knee Jump\n\nTa puissance est doublée jusqu'à la fin du donjon !");
  bonusActifs.double_attaque = true;
  afficherBonusActifs();
}

function effetBrumeProtectrice() {
  alert("Fait :\n\n30 Burpees Push-Ups\n\nTu peux ignorer tous les défis physiques des prochains monstres !");
  bonusActifs.ignorer_defis = true;
  afficherBonusActifs();
}

function afficherBonusActifs() {
  const zone = document.getElementById("bonus-actifs");
  let bonus = "";

  if (bonusActifs.double_attaque) {
    bonus += "🔥 Puissance doublée active<br>";
  }
  if (bonusActifs.ignorer_defis) {
    bonus += "🌬 Défis ignorés actifs<br>";
  }

  zone.innerHTML = bonus ? `<div class="bonus-active">${bonus}</div>` : "";
}

function effetRepiocherInventaire() {
  const objetsPerdus = inventaire.length;
  inventaire = [];

  if (objets.length === 0) {
    alert("😵 La Chose a tout volé, et il n'y a plus d'objets ! Tu repars avec une Épée en bois...");
    inventaire.push({ id: 99, nom: "Épée en bois rouillée", type: "arme", effet: "Dégâts +2", image: "img/default.png" });
    afficherInventaire();
    afficherRencontre();
    return;
  }

  let nouvelInventaire = [];
  let tentative = 0;
  do {
    nouvelInventaire = [];
    let indices = [];
    while (indices.length < Math.min(objetsPerdus, 4) && indices.length < objets.length) {
      const randIndex = Math.floor(Math.random() * objets.length);
      if (!indices.includes(randIndex)) indices.push(randIndex);
    }
    nouvelInventaire = indices.map(i => objets[i]);
    tentative++;
    if (tentative > 10) break;
  } while (nouvelInventaire.length > 0 && !nouvelInventaire.some(o => o.type === "arme"));

  if (nouvelInventaire.length === 0 || !nouvelInventaire.some(o => o.type === "arme")) {
    nouvelInventaire.push({nom: "Épée rouillée de secours", type: "arme", effet: "Dégâts +2", image: "img/default.png" });
  }

  nouvelInventaire.forEach(objet => {
    const index = objets.indexOf(objet);
    if (index !== -1) objets.splice(index, 1);
    inventaire.push(objet);
  });

  alert("👹 La Chose surgit et te dépouille de tous tes objets ! Heureusement tu récupères quelques artefacts éparpillés...");
  afficherInventaire();
  afficherRencontre();
}

function effetGagnePvChaqueMinute() {
  const boss = paquetRencontres[0];
  let compteur = 60; // 60 secondes

  const monstreZone = document.getElementById("monstre-actuel");
  monstreZone.innerHTML = `
    <div>
      <h3>${boss.nom}</h3>
      <img src="${boss.image}" alt="${boss.nom}" width="100">
      <p id="affichage-pv">PV: ${boss.pv}</p>
      <div id="compteur-spectre" style="margin-top: 10px; font-size: 14px; color: lightblue;">
        ⏳ +1000 PV dans : ${compteur}s
      </div>
    </div>
  `;

  boss._pvBonusInterval = setInterval(() => {
    compteur--;

    if (compteur <= 0) {
      boss.pv += 1000;
      compteur = 60;

      // ➡️ Effet "+1000 PV"
      const gainPv = document.createElement("div");
      gainPv.textContent = "+1000 PV !";
      gainPv.style.color = "lightgreen";
      gainPv.style.fontWeight = "bold";
      gainPv.style.animation = "fadeOut 2s forwards";
      monstreZone.appendChild(gainPv);

      setTimeout(() => {
        gainPv.remove();
      }, 2000);
    }

    if (paquetRencontres.length > 0 && paquetRencontres[0] === boss) {
      // ➡️ Mise à jour du compteur + PV
      const pvElement = document.getElementById("affichage-pv");
      if (pvElement) pvElement.textContent = `PV: ${boss.pv}`;

      const compteurZone = document.getElementById("compteur-spectre");
      if (compteurZone) compteurZone.textContent = `⏳ +1000 PV dans : ${compteur}s`;
    }
  }, 1000);

  alert("Le Roi des Spectres regagne 1000 PV toutes les minutes !");
}

function effetEnchainementExercices() {
  const rencontre = paquetRencontres[0]; // La Sorcière
  
  alert("La Sorcière t'impose 5 exercices spéciaux !");
  
  const exercices = [
    "Superman", "Squat pulsé", "Fente gauche", "Fente droite", "Child's pose"
  ];

  const zoneDefi = document.getElementById("defi-courant");

  if (!zoneDefi) {
    console.error("Zone 'defi-courant' introuvable !");
    return;
  }

  zoneDefi.innerHTML = `<div class="carte">
    <h2>Exercice Spécial imposé par ${rencontre.nom}</h2>
    <ul>
      ${exercices.map(ex => `<li>${ex} 20sec.</li>`).join("")}
    </ul>
    <p>Effectue tous les exercices avant de continuer !</p>
    <button onclick="continuerApresDefis()">Exercices terminés</button>
  </div>`;

  const monstreZone = document.getElementById("monstre-actuel");
  if (monstreZone) {
    monstreZone.innerHTML = ""; 
  }

  document.getElementById("btn-monstre-battu").disabled = true; 

  ajouterAnimation("defi-courant", "fade-in");
}

function effetRefaireDefisVaincus() {
  alert("Le Séché invoque les défis de tous les monstres vaincu !");
  const defis = historiqueMonstres
    .map(m => {
      const match = m.match(/\(([^)]+)\)/);
      if (match) {
        return match[1].replace(/\d+\s*PV\s*/g, '').trim();
      }
      return null;
    })
    .filter(Boolean);

  const zoneDefi = document.getElementById("defi-courant");

  if (!zoneDefi) {
    console.error("Zone 'defi-courant' introuvable !");
    return;
  }

  if (defis.length === 0) {
    zoneDefi.innerHTML = `<div class="carte">
      <h2>Aucun défi à refaire</h2>
      <p>Tu peux continuer !</p>
      <button onclick="continuerApresDefis()">Continuer</button>
    </div>`;
  } else {
    zoneDefi.innerHTML = `<div class="carte">
      <h2>Défis à refaire :</h2>
      <ul>
        ${defis.map(defi => `<li>${defi}</li>`).join("")}
      </ul>
      <p>Effectue tous les défis listés avant de continuer !</p>
      <button onclick="continuerApresDefis()">Défis terminés</button>
    </div>`;
  }

  document.getElementById("btn-monstre-battu").disabled = true;
  document.getElementById("monstre-actuel").innerHTML = "";
}

function effetResurrection() {
  const anciensMonstres = piocherMonstres();
  paquetRencontres = [...anciensMonstres, paquetRencontres[0]];
  boss.regle_speciale = null;
  alert("Le Nécromancien invoque de nouveaux monstres !");
  afficherRencontre();
}

function effetTitan() {
  const boss = paquetRencontres[0];
  boss.pv = 10000;
  boss.regle_speciale = null;

  alert("Le Colosse Antique devient un Titan à 10000 PV !");
  
  afficherRencontre();
}

function appliquerRegleSpeciale(boss, regle) {
  console.log("Application règle spéciale de : ", boss.nom);

  if (!regle) return;

  if (regle === "repiocher_inventaire") {
    effetRepiocherInventaire();
  }
  else if (regle === "gagne_pv_chaque_minute") {
    effetGagnePvChaqueMinute();
  }
  else if (regle === "enchainement_exercices") {
    effetEnchainementExercices();
  }
  else if (regle === "refaire_defis_vaincus") {
    effetRefaireDefisVaincus();
  }
  else if (regle === "resurrection") {
    effetResurrection();
  }
  else if (regle === "titan") {
    effetTitan();
  }
}

function monstreBattu() {
  if (paquetRencontres.length === 0) return;

  const rencontre = paquetRencontres[0];

  if (rencontre.special && typeof window[rencontre.special] === "function") {
    window[rencontre.special]();
    paquetRencontres.shift();
    mettreAJourBarreProgression();
    afficherRencontre();
    return;
  }

  paquetRencontres.shift(); 
  mettreAJourBarreProgression();

  if (rencontre._pvBonusInterval) {
    clearInterval(rencontre._pvBonusInterval);
  }

  // Ajouter au journal
  function genererMessageVictoire(nomMonstre) {
    if (phrasesDisponibles.length === 0) {
      phrasesDisponibles = [...toutesLesPhrases];
    }
    const index = Math.floor(Math.random() * phrasesDisponibles.length);
    const phraseChoisie = phrasesDisponibles.splice(index, 1)[0];
    return phraseChoisie.replace('{nom}', nomMonstre);
  }

  if (rencontre.nom) {
    let message = `➔ ${genererMessageVictoire(rencontre.nom)}`;

    if (rencontre.pv && rencontre.defi) {
      const defiNettoye = rencontre.defi.replace(/avant le combat/gi, "").trim();
      message += ` <br><span class="defi">(${rencontre.pv}PV ${defiNettoye})</span>`;
    }

    historiqueMonstres.push(message);
    afficherHistorique();
  }

  if (rencontre.recompenses) {
    for (let i = 0; i < rencontre.recompenses; i++) piocherEquipementSimple();
  }

  mettreAJourBarreProgression();

  afficherRencontre();
}

function esquiverMonstre() {
if (paquetRencontres.length === 0) return;
const rencontre = paquetRencontres[0];
if (!rencontre.pv) {
  alert("Impossible d'esquiver un Boss !");
  return;
}
if (inventaire.length === 0) {
  alert("Pas d'équipement pour esquiver !");
  return;
}

const armes = inventaire.filter(objet => objet.type === "arme");


if (armes.length === 1) {
  const objetsNonArmes = inventaire.filter(objet => objet.type !== "arme");

  if (objetsNonArmes.length === 0) {
    alert("Impossible d'esquiver sans perdre votre dernière arme !");
    return;
  }

  const randIndex = Math.floor(Math.random() * objetsNonArmes.length);
  const objetASupprimer = objetsNonArmes[randIndex];
  const indexDansInventaire = inventaire.indexOf(objetASupprimer);
  inventaire.splice(indexDansInventaire, 1);
} else {

  const rand = Math.floor(Math.random() * inventaire.length);
  inventaire.splice(rand, 1);
}

afficherInventaire();
paquetRencontres.shift();
nombreEsquives++;
alert(`Vous devez faire ${nombreEsquives * 100} jumping jacks !`);
ajouterAnimation("zone-monstre", "shake");
afficherRencontre();
}

function utiliserBonus() {
const index = inventaire.findIndex(objet => objet.type === "bonus");
if (index === -1) return alert("Aucun bonus à utiliser !");
inventaire.splice(index, 1);
afficherInventaire();
alert("Bonus utilisé !");
}

function recommencer() {
  location.reload();
}

function fermerEvenementSpecial() {
  document.getElementById("evenement-special").style.display = "none";
  document.getElementById("zone-monstre").style.display = "block"; // ➔ Remet la zone normale visible

  if (typeof window._suiteCallbackBossSpecial === "function") {
    window._suiteCallbackBossSpecial();
  }
}

function continuerApresDefis() {
  afficherRencontre();
  document.getElementById("btn-monstre-battu").disabled = false;
}

function continuerEvenementSpecial() {
  document.getElementById("evenement-special").style.display = "none";
  document.getElementById("zone-monstre").style.display = "block";
  afficherRencontre();
}

function afficherHistorique() {
const liste = document.getElementById("liste-historique");
liste.innerHTML = "";
historiqueMonstres.forEach(monstre => {
  const li = document.createElement("li");
  li.innerHTML = monstre;
  liste.appendChild(li);
});
}

function ouvrirPopupExercices() {
  const popup = document.getElementById("popup-exercices");
  popup.classList.add("active");

  const exercicesTries = [...exercices].sort((a, b) =>
    a.nom.localeCompare(b.nom)
  );

  const liste = document.getElementById("liste-exercices");
  liste.innerHTML = exercicesTries.map(ex => `
    <li style="margin-bottom:10px;">
      <img src="${ex.image}" alt="${ex.nom}" style="width:40px; vertical-align:middle; margin-right:10px;">
      ${ex.nom}
    </li>
  `).join("");
}

function fermerPopupExercices() {
  document.getElementById("popup-exercices").style.display = "none";
}

function demarrerChrono() {
  debutChrono = Date.now();
  
  intervalChrono = setInterval(() => {
    const tempsPasse = Date.now() - debutChrono;

    const minutes = Math.floor(tempsPasse / 60000);
    const secondes = Math.floor((tempsPasse % 60000) / 1000);
    const millisecondes = tempsPasse % 1000;

    document.getElementById("affichage-chrono").textContent =
      `${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}:${millisecondes.toString().padStart(3, '0')}`;
  }, 50);
}

function arreterChrono() {
  clearInterval(intervalChrono);
}

function mettreAJourBarreProgression() {
  if (totalCartes === 0) return; 

  const cartesRestantes = paquetRencontres.length;
  const cartesPassees = totalCartes - cartesRestantes;
  const pourcentage = Math.min((cartesPassees / totalCartes) * 100, 100);

  const barre = document.getElementById("barre-progression");
  barre.style.width = `${pourcentage}%`;

  if (pourcentage < 50) {
    barre.style.background = "#00ff00"; // Vert
  } else if (pourcentage < 80) {
    barre.style.background = "orange"; // Orange
  } else {
    barre.style.background = "red"; // Rouge
  }
}

function ajouterFallbackImage(imgElement) {
  imgElement.onerror = () => {
    imgElement.onerror = null;
    imgElement.src = "/img/default.png";
  };
}

document.getElementById("btn-monstre-battu").addEventListener("click", monstreBattu);
document.getElementById("btn-esquive").addEventListener("click", esquiverMonstre);
document.getElementById("btn-utiliser-bonus").addEventListener("click", utiliserBonus);
document.getElementById("btn-recommencer").addEventListener("click", recommencer);
document.getElementById("btn-regles").addEventListener("click", () => {alert(texteRegles);});
document.getElementById("btn-historique").addEventListener("click", () => {
  const histo = document.getElementById("historique");
  histo.style.display = (histo.style.display === "none") ? "block" : "none";
  });
document.querySelectorAll("img").forEach(img => {ajouterFallbackImage(img);});
