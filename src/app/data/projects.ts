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
    ],
    images: [],
    link: undefined,
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
    ],
    images: [],
    link: undefined,
  },
  {
    id: 'decibulles-bot',
    name: "Bot d'alerte billetterie — Festival Décibulles",
    folder: 'perso',
    year: '2025',
    role: 'Développeur',
    context: 'Projet personnel',
    stack: ['Python', 'Automatisation de navigateur', 'SMTP'],
    summary: "Script d'automatisation qui surveille la revente de billets et alerte par email en temps réel.",
    description: [
      "Face à la vente instantanée des billets de revente d'un festival, j'ai identifié la problématique et développé un script Python pour surveiller les disponibilités en temps réel.",
      "Le site cible étant sous WordPress et rendant le scraping classique difficile, j'ai mis en place un outil capable de simuler l'ouverture de la page et d'analyser le code source généré côté client.",
      "Le script vérifiait la disponibilité toutes les 10 secondes et m'envoyait une alerte email instantanée dès qu'un billet apparaissait, pour finaliser l'achat manuellement. Le projet a aussi mis en évidence certaines failles de sécurité liées au scraping du site cible.",
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
      "Conception et développement complet d'un compilateur pour un langage de programmation inventé de toutes pièces, axé sur le vocabulaire culinaire.",
      "La réalisation technique a couvert l'analyse lexicale (JFlex), l'analyse syntaxique (CUP), la construction de l'Arbre Syntaxique Abstrait et de la Table des Symboles, jusqu'à la génération d'un code assembleur pleinement exécutable.",
      "En parallèle du développement, j'ai piloté une équipe de quatre étudiants en méthode Agile (Scrum) : gestion des sprints, répartition des tâches (PBS, WBS, Gantt) via Jira, et coordination pour valider les 9 paliers de tests successifs.",
    ],
    images: [],
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
      "Au sein d'un groupe de travail, j'ai été chargé de la mise en place de l'architecture MVC de l'application et de la configuration de son système de routage, en exploitant le framework Hono.",
      "J'ai implémenté un routage avancé pour gérer des URL dynamiques, extrayant et affichant les données des villes et de leurs parkings depuis une base locale.",
      "J'ai conçu l'interface via des composants fonctionnels TSX générant des vues HTML dynamiques, et sécurisé la navigation par une gestion centralisée des erreurs HTTP.",
    ],
    images: [],
    link: undefined,
  },
  {
    id: 'loves-me-not',
    name: 'Mini-jeu « Loves me… loves me not »',
    folder: 'ecole',
    year: '2024',
    role: 'Développeur Front-End',
    context: 'Projet académique — L1 MIASHS',
    stack: ['HTML', 'CSS', 'JavaScript'],
    summary: "Recréation du mini-jeu de Super Mario 64 DS dans une interface simulant une Nintendo DS.",
    description: [
      "J'ai pris en charge la logique interactive et l'intégration graphique. Après l'exercice de base (génération et suppression dynamique d'éléments dans le DOM), j'ai imaginé et conçu une version finale inspirée de l'univers de Mario.",
      "L'étape finale exigeait une réappropriation créative d'une étoile interactive : j'ai choisi de recréer le mini-jeu nostalgique « Loves me… loves me not » de Super Mario 64 DS.",
      "J'ai conçu une interface simulant une console Nintendo DS, avec une vidéo en arrière-plan pour les animations et l'ambiance sonore, et adapté la logique JavaScript pour recréer l'effeuillage aléatoire des pétales.",
    ],
    images: [],
    link: undefined,
  },
];

export const projectsInFolder = (id: string): Project[] =>
  PROJECTS.filter((p) => p.folder === id);

export const projectById = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id);
