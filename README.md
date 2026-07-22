# Portfolio OS — Thomas Mathis

Portfolio interactif présenté comme un bureau façon Windows XP. Le visiteur
explore des dossiers organisés par contexte (alternance, personnel, académique)
et ouvre chaque projet dans une fenêtre déplaçable.

**Angular 22** · standalone components · signals · [XP.css](https://github.com/botoxparty/XP.css) · aucune autre dépendance UI.

## Démarrer

```bash
npm install
npm start
```

Le site s'ouvre sur `http://localhost:4200`.

## Mise en ligne — GitHub Pages

Le déploiement est automatique via GitHub Actions (`.github/workflows/deploy.yml`).
Le `base-href` est calculé tout seul à partir du nom du dépôt, donc rien à régler
à la main.

Première mise en ligne :

```bash
git init
git add .
git commit -m "Portfolio OS"
git branch -M main
git remote add origin https://github.com/DocXydre/<nom-du-repo>.git
git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

À chaque `git push` sur `main`, le site se reconstruit et se publie sur
`https://docxydre.github.io/<nom-du-repo>/`. L'avancement est visible dans
l'onglet **Actions** du dépôt.

> Le dépôt doit être **public** (ou avoir GitHub Pages activé via un plan payant).

## Structure

```
src/app/
├── core/
│   ├── models.ts            # AppWindow, Project, Folder
│   └── window.service.ts    # état de toutes les fenêtres (signals)
├── os/
│   ├── desktop.ts           # icônes du bureau
│   ├── window-frame.ts      # châssis XP générique + drag/resize (pointer events)
│   ├── taskbar.ts           # barre des tâches, branchée sur le signal
│   └── start-menu.ts        # menu Démarrer
├── apps/
│   ├── explorer.ts          # contenu d'un dossier
│   └── project-viewer.ts    # fiche d'un projet
├── data/
│   └── projects.ts          # ⇐ LE fichier à éditer pour le contenu
└── app.ts                   # racine : bureau + fenêtres + taskbar
```

## Ajouter / modifier un projet

Tout se passe dans `src/app/data/projects.ts`. Ajouter un objet au tableau
`PROJECTS` suffit — aucune ligne d'interface à toucher.

Pour des captures d'écran : déposer les images dans `public/screenshots/` et
renseigner leurs chemins dans le champ `images` du projet, par exemple
`images: ['/screenshots/vosges-1.webp']`.

## Explorateur & contenu

Le bureau ouvre **un seul explorateur** qui se navigue en place (arbre
« Dossiers » à gauche, Précédente / Suivante / Dossier parent, barre d'adresse).
L'arbre du système de fichiers virtuel est décrit dans
`src/app/data/filesystem.ts` :

```
Bureau
├── Mes documents   → CV.pdf (lecteur PDF), Contact (fenêtre À propos)
├── Mes images      → photos (visionneuse)
└── Poste de travail
    ├── Alternance & Stage
    ├── Projets personnels
    └── Projets académiques   → un .txt par projet (fiche projet)
```

Le volet gauche affiche le volet de tâches XP (Autres emplacements / Détails) ;
le bouton **Dossiers** de la barre d'outils bascule vers l'arbre des dossiers.
La vue « Poste de travail » regroupe le contenu par sections.

- **CV** : remplacer le fichier `public/docs/CV_Thomas_Mathis.pdf`
- **Photos** : déposer les images dans `public/photos/` et les déclarer dans le
  tableau `PHOTOS` de `filesystem.ts`
- **Projets** : `src/app/data/projects.ts`
- **Contact** : le texte vit dans la fenêtre « À propos » (`src/app/app.ts`)

## Icônes

Les icônes sont de vraies images dans `public/icons/` :

| Fichier | Utilisé pour |
|---|---|
| `folder.png` | dossiers de projets |
| `folder-docs.png` | Mes documents |
| `folder-pics.png` | Mes images |
| `computer.png` | Poste de travail |
| `text.png` | fiches projet (.txt) |
| `pdf.png` | CV.pdf |
| `photo.png` | fichiers image |
| `user.png` | À propos / Contact |
| `winflag.png` | bouton Démarrer |
| `folder-work.png`, `star.png`, `folder-academic.png` | en réserve |

Deux façons de changer une icône :

- **remplacer le fichier** dans `public/icons/` en gardant le même nom (le plus simple) ;
- **changer le nom** référencé : les dossiers pointent vers leur icône via le champ
  `icon` dans `src/app/data/projects.ts` ; il suffit d'y mettre le nom d'un autre
  fichier présent dans `public/icons/` (sans le `.png`).

Idéalement des PNG carrés de 32×32 px avec fond transparent.

## Idées pour la suite

Chaque ajout se branche sans toucher au noyau — une nouvelle valeur de
`WindowType` et un composant dans `apps/` :

- sons XP (coupés par défaut, avec un interrupteur)
- écran de démarrage animé
- démineur / terminal jouables
- adaptation tactile (fenêtres plein écran sous 768px)
