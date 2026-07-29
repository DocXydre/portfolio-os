import { Folder, Project } from '../core/models';

/* ------------------------------------------------------------------
   LE fichier à éditer pour faire évoluer le contenu du portfolio.
   Ajouter un projet = ajouter un objet ici. Aucune ligne d'UI à toucher.
   Pour ajouter des captures : déposer l'image dans public/screenshots/
   et référencer '/screenshots/mon-image.webp' dans images[].
   ------------------------------------------------------------------ */

export const FOLDERS: Folder[] = [
  { id: 'stage', name: 'Stage', icon: 'folder' },
  { id: 'perso', name: 'Projets personnels', icon: 'folder' },
  { id: 'ecole', name: 'Projets académiques', icon: 'folder' },
];

export const PROJECTS: Project[] = [
  {
    id: 'vosges-info',
    name: 'Application de gestion des demandes — Vosges Info',
    folder: 'stage',
    year: '2025',
    role: 'Développeur Front-End',
    context: "Stage en développement web — agence Alchimy Communication",
    stack: ['WordPress', 'ACF', 'JavaScript (Ajax)', 'CSS', 'Figma'],
    summary: "Plateforme interne pour centraliser et suivre les demandes de publication du site Vosges Info.",
    description: [
      "Conception et développement d'une plateforme interne sur mesure pour l'équipe du site d'actualité Vosges Info. L'outil centralise, soumet et suit des demandes de publication spécifiques (bannières, popups, etc.).",
      "L'objectif était de remplacer un formulaire existant peu intuitif qui générait des erreurs de saisie. J'ai conçu l'interface et réalisé l'intégration : élaboration des maquettes, restructuration du formulaire en sections distinctes, et affichage des demandes en \"Bento design\".",
      "La nouvelle interface limite les erreurs grâce à une ergonomie repensée et intègre un système de suivi des statuts clair et réactif.",
      "Côté finition, l'environnement de développement (via Laravel Mix) exposait le rendu en local sur le réseau : je pouvais l'ouvrir directement depuis mon téléphone et ajuster le responsive en conditions réelles, sans souci.",
    ],
    images: [
      'projects/vosges-1.webp',
      'projects/vosges-2.webp',
      'projects/vosges-3.webp',
      'projects/vosges-4.webp',
      'projects/vosges-5.webp',
    ],
    link: undefined,
    figma: 'https://www.figma.com/design/pSmPCC5WJnbmNNSu72wy55/Formulaire-Vosges-Infos?t=BCpUqu8NLA8qOnzi-1',
  },
  {
    id: 'portfolio-ebauche',
    name: 'Portfolio web (ébauche)',
    folder: 'stage',
    year: '2025',
    role: 'Développeur & UI Designer',
    context: "Stage en développement web — agence Alchimy Communication",
    stack: ['WordPress', 'ACF', 'Timber (Twig)', 'SCSS (Laravel Mix)', 'Docker', 'Figma'],
    summary: "Portfolio interactif développé de A à Z, architecture MVC et back-office dynamique.",
    description: [
      "Dans le prolongement de ma formation interne sur l'écosystème WordPress, j'ai initié le développement de mon propre portfolio interactif, conçu et réalisé en totale autonomie.",
      "J'ai élaboré les maquettes en \"Bento design\", puis structuré le back-end avec des Custom Post Types dédiés pour gérer dynamiquement l'affichage des formations, expériences et projets.",
      "Le projet a abouti à un site techniquement opérationnel : architecture MVC fonctionnelle, base de données configurée pour une saisie simplifiée via Gutenberg, intégration graphique réalisée. Une ébauche aboutie côté technique, mise en pause pour un autre projet.",
      "L'environnement de développement (assets compilés avec Laravel Mix) exposait le rendu en local sur le réseau : je pouvais l'ouvrir directement depuis mon téléphone et peaufiner le responsive en conditions réelles, sans souci.",
    ],
    images: [
      'projects/portfolio-1.webp',
      'projects/portfolio-2.webp',
      'projects/portfolio-3.webp',
      'projects/portfolio-4.webp',
      'projects/portfolio-5.webp',
      'projects/portfolio-6.webp',
      'projects/portfolio-7.webp',
    ],
    link: undefined,
    figma: 'https://www.figma.com/design/aYGvuhs8usYX9DWtr6TAYU/Portfolio?node-id=0-1&t=BCpUqu8NLA8qOnzi-1',
  },
  {
    id: 'decibulles-bot',
    name: "Bot d'alerte billetterie — Festival Décibulles",
    folder: 'perso',
    year: '2025',
    role: 'Développeur',
    context: 'Projet personnel',
    stack: ['Python', 'Selenium', 'geckodriver (Firefox)', 'Brevo (SMTP)'],
    summary: "Script d'automatisation qui surveille la revente de billets et alerte par email en temps réel.",
    description: [
      "Face à la revente de billets d'un festival qui partaient en quelques secondes, j'ai développé un script Python pour surveiller les disponibilités en continu et être prévenu à l'instant où un billet apparaissait.",
      "Le site cible, sous WordPress, générait son contenu côté client : le scraping classique (requête HTTP + parsing) ne voyait rien. J'ai donc piloté un vrai navigateur Firefox avec Selenium (via geckodriver) pour charger la page comme un utilisateur, puis inspecter le DOM brut à la recherche d'un billet correspondant au jour précis que je visais.",
      "Le script rafraîchissait la page toutes les ~10 secondes. Dès qu'un billet du bon jour était détecté, il déclenchait un email d'alerte via l'API SMTP de Brevo, envoyé sur mon adresse iCloud — d'où une notification instantanée sur mon iPhone pour finaliser l'achat à la main.",
      "Le projet a aussi mis en évidence certaines faiblesses de protection du site face à ce type d'automatisation.",
    ],
    images: [],
    link: undefined,
  },
  {
    id: 'pushpile',
    name: 'Compilateur PushPile',
    folder: 'ecole',
    year: '2025 / 2026',
    role: 'Chef de projet',
    context: 'Projet interdisciplinaire — L3 MIAGE',
    stack: ['Java 17', 'Maven', 'JFlex', 'CUP', 'Assembleur BETA (BSIM)', 'Git', 'Jira'],
    summary: "Compilateur complet pour un langage inventé sur le thème culinaire, du lexer à la génération de code.",
    description: [
      "Conception et développement complet d'un compilateur pour un langage de programmation inventé de toutes pièces, sur le thème culinaire : on y écrit une « recette » avec des mots-clés comme « mélanger », « ajouter », « cuit… », « mijoter » ou « dresser » — une syntaxe ludique par-dessus une vraie sémantique de langage.",
      "La réalisation technique a couvert l'analyse lexicale (JFlex), l'analyse syntaxique (CUP), la construction de l'Arbre Syntaxique Abstrait et de la Table des Symboles, jusqu'à la génération d'un code assembleur BETA pleinement exécutable sur le simulateur BSIM.",
      "En parallèle du développement, j'ai piloté une équipe de quatre étudiants en méthode Agile (Scrum) : gestion des sprints, répartition des tâches (PBS, WBS, diagramme de Gantt) via Jira, et coordination pour valider les 9 paliers de tests successifs.",
      "À noter : le PBS présenté ici a volontairement été réalisé sous forme de carte mentale, à la demande de notre encadrant — ce n'est pas la forme arborescente stricte que prend habituellement un Product Breakdown Structure.",
    ],
    images: [
      'projects/pushpile-code.webp',
      'projects/pushpile-terminal.webp',
      'projects/pushpile-bsim.webp',
      'projects/pushpile-gantt.webp',
      'projects/pushpile-pbs.webp',
    ],
    repo: 'https://github.com/DocXydre/PushPile',
    link: undefined,
  },
  {
    id: 'europark',
    name: 'Système de gestion de parkings — EuroPark',
    folder: 'ecole',
    year: '2024 / 2025',
    role: 'Co-développeur web',
    context: 'TD Programmation Web — L3 MIASHS',
    stack: ['TypeScript', 'Hono', 'Bun', 'TSX', 'HTML5', 'CSS (Milligram)'],
    summary: "Application MVC de gestion de parkings avec routage dynamique et vues TSX.",
    description: [
      "Projet en binôme (avec Justin Burr) : application web « EuroPark » de présentation et de gestion de parkings à travers l'Europe. J'ai écrit et commenté l'essentiel du code, mon binôme s'est chargé des tests.",
      "J'ai mis en place l'architecture MVC de l'application et son système de routage avec le framework Hono (sur Bun). Le routage gère des URL dynamiques qui parcourent la hiérarchie des données : liste des villes, détail d'une ville, liste de ses parkings, puis fiche d'un parking (nombre de places, tarif horaire).",
      "L'interface est générée par des composants fonctionnels TSX produisant des vues HTML dynamiques, stylées avec la bibliothèque Milligram. J'ai aussi sécurisé la navigation par une gestion centralisée des erreurs HTTP, et configuré le service des fichiers statiques (via @hono/node-server) pour l'affichage des visuels.",
    ],
    images: [
      'projects/europark-1.webp',
      'projects/europark-2.webp',
      'projects/europark-3.webp',
      'projects/europark-4.webp',
      'projects/europark-5.webp',
    ],
    demoUrl: 'https://europark.thomasmathis.me',
    repo: 'https://github.com/DocXydre/ProjetParking_JBTM',
    link: undefined,
  },
  {
    id: 'loves-me-not',
    name: 'Mini-jeu « Loves me… loves me not »',
    folder: 'ecole',
    year: '2022',
    role: 'Développeur Front-End',
    context: 'Projet académique — L1 MIASHS',
    stack: ['HTML', 'CSS', 'JavaScript'],
    summary: "Recréation du mini-jeu de Super Mario 64 DS dans une interface simulant une Nintendo DS.",
    description: [
      "Projet en deux temps autour de la manipulation dynamique du DOM en JavaScript. J'ai pris en charge toute la logique interactive et l'intégration graphique.",
      "Première partie : une étoile placée au centre de l'écran. Un clic sur son cœur fait apparaître des branches disposées aléatoirement autour d'elle, et chaque branche se supprime d'un simple clic — un exercice concret de création et de suppression d'éléments à la volée.",
      "Seconde partie : j'ai réemployé cette mécanique pour en faire un mini-jeu, en réappropriation créative du concept. Le bouton central devient une fleur : chaque pétale effeuillé retire une ligne de texte (« Loves me… loves me not ») et fait changer le bouton d'apparence à chaque interaction, en clin d'œil au mini-jeu de Super Mario 64 DS.",
      "Le tout est présenté dans une interface qui simule une console Nintendo DS, avec une vidéo en arrière-plan gérant l'animation et l'ambiance sonore. Réalisé en HTML, CSS et JavaScript.",
    ],
    images: [
      'projects/lovesme-1.webp',
      'projects/lovesme-2.webp',
    ],
    demoUrl: 'https://lovesme.thomasmathis.me/',
    repo: 'https://github.com/DocXydre/ProjetwebL1',
    link: undefined,
  },
];

export const projectsInFolder = (id: string): Project[] =>
  PROJECTS.filter((p) => p.folder === id);

export const projectById = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id);
