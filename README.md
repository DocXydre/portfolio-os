# Portfolio OS — Thomas Mathis

Un portfolio interactif présenté comme un système d'exploitation façon **Windows XP**,
entièrement recréé dans le navigateur : bureau, fenêtres déplaçables, barre des tâches,
menu Démarrer, explorateur de fichiers, visionneuse de photos, lecteur PDF… tout est fait
main. J'en reprends les codes (le thème « Luna ») sans copier au pixel près : c'est une
version personnalisée, pas une reproduction exacte.

**Angular 22** · composants standalone · signals · [XP.css](https://github.com/botoxparty/XP.css) · aucune autre dépendance UI.

---

## Le concept

Trois raisons au choix du thème Windows XP :

- **Sortir du portfolio générique.** Plutôt qu'une page qui défile, un environnement à
  explorer — plus marquant et mémorable pour un recruteur.
- **Une référence personnelle.** Windows XP est le premier ordinateur que j'ai utilisé ;
  c'est un clin d'œil à mes débuts en informatique.
- **L'ergonomie.** La métaphore du bureau et des fichiers est simple et intuitive : ranger
  mes projets en dossiers donne envie de fouiner plutôt que de lire une liste.

## Sous le capot

L'application est développée en **Angular 22** (composants standalone et *signals*), sans
framework d'interface : juste du SCSS et **XP.css** pour l'esprit Luna. Les fenêtres, le
gestionnaire de fenêtres, le système de fichiers virtuel, l'écran de veille à bulles et la
séquence de démarrage sont tous des composants maison.

## L'hébergement

Ce site ne tourne pas chez un hébergeur classique : je l'héberge **moi-même**, sur un PC de
2008 remis en route et administré de A à Z. C'est la partie dont je suis le plus fier.

- **La machine :** un vieux PC (processeur Intel Atom, 2 Go de RAM) sous **Debian**,
  transformé en serveur — il ne fait que servir des fichiers statiques, il ne compile jamais.
- **Serveur web :** **Caddy**, avec HTTPS automatique (certificats Let's Encrypt) et un vrai
  domaine, **thomasmathis.me**. Un bloc de config = un site.
- **Réseau :** la box étant en CGNAT, j'ai demandé une IPv4 « full-stack » (gratuit chez Free)
  pour être joignable depuis l'extérieur, avec réservation DHCP, pare-feu (ufw) et fail2ban.
- **Accès distant sécurisé :** **Tailscale** (VPN) pour administrer et déployer le serveur
  d'où que je sois, sans exposer SSH sur Internet.
- **Déploiement automatique :** un simple `git push` déclenche GitHub Actions, qui compile
  puis envoie la nouvelle version sur le serveur via Tailscale (avec un miroir sur GitHub Pages).
- **Une contrainte assumée :** le CPU de 2008 ne fait pas tourner les runtimes récents (Bun,
  Node moderne). Certains projets dynamiques sont donc pré-rendus en statique pour rester
  hébergeables sur cette machine.

> Config et scripts d'hébergement : `self-hosting/Caddyfile` et `self-hosting/deploy.sh`.
> Les workflows sont dans `.github/workflows/` (`deploy.yml` pour GitHub Pages,
> `deploy-selfhost.yml` pour le serveur via Tailscale).

## Un binôme IA

J'ai développé ce portfolio avec l'aide de **Claude** (l'assistant IA d'Anthropic) comme
binôme de programmation, de l'architecture jusqu'aux finitions.

---

## Démarrer

```bash
npm install
npm start
```

Le site s'ouvre sur `http://localhost:4200`.

## Structure

```
src/app/
├── core/
│   ├── models.ts            # AppWindow, Project, Folder, FsNode
│   └── window.service.ts    # état de toutes les fenêtres (signals)
├── os/
│   ├── desktop.ts           # icônes du bureau
│   ├── window-frame.ts      # châssis XP générique + drag/resize (pointer events)
│   ├── taskbar.ts           # barre des tâches
│   ├── start-menu.ts        # menu Démarrer
│   ├── boot.ts              # séquence de démarrage
│   └── screensaver.ts       # écran de veille à bulles
├── apps/
│   ├── explorer.ts          # explorateur de fichiers (arbre + volet de tâches)
│   ├── project-viewer.ts    # fiche d'un projet
│   ├── photo-viewer.ts      # visionneuse de photos
│   ├── pdf-viewer.ts        # lecteur PDF (CV)
│   └── ie.ts                # Internet Explorer (projets en live via iframe)
├── data/
│   ├── projects.ts          # ⇐ LE fichier à éditer pour le contenu
│   └── filesystem.ts        # arbre du système de fichiers virtuel
└── app.ts                   # racine : bureau + fenêtres + taskbar
```

## Ajouter / modifier un projet

Tout se passe dans `src/app/data/projects.ts` : ajouter un objet au tableau `PROJECTS`
suffit, aucune ligne d'interface à toucher. Pour des captures, déposer les images dans
`public/projects/` et renseigner leurs chemins dans le champ `images` du projet.

- **CV** : remplacer le PDF dans `public/docs/`
- **Photos** : déposer les images dans `public/photos/` et les déclarer dans le tableau
  `PHOTOS` de `filesystem.ts`
- **Icônes** : de vraies images dans `public/icons/` (PNG carrés à fond transparent) ;
  chaque dossier/fichier pointe vers son icône via le champ `icon` (sans le `.png`)

## Déploiement

À chaque `git push` sur `main`, deux cibles se mettent à jour automatiquement : le serveur
auto-hébergé (via Tailscale) et le miroir **GitHub Pages**. Le `base-href` de GitHub Pages
est calculé tout seul à partir du nom du dépôt.
