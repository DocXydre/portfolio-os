# Portfolio OS — reste à faire

État des lieux et priorités pour finir propre. On coche au fur et à mesure.

## ✅ Déjà en place

- Bureau OS complet : fenêtres (drag / resize / min / max / close), taskbar, menu Démarrer
- Explorateur (arbre + volet de tâches), fiche projet, visionneuse photos (swipe), lecteur PDF (CV)
- **Internet Explorer** avec projets **en live** : Loves me not (jeu DS) et EuroPark
- Écran de veille à bulles, séquence de démarrage (BIOS → Windows TM → Bienvenue)
- Fenêtre profil « cachée » (via le bandeau du menu Démarrer)
- **Auto-hébergement** : serveur Debian, HTTPS (Caddy + Let's Encrypt), domaine `thomasmathis.me`
- **Déploiement auto** : git push → GitHub Actions → serveur via Tailscale (+ miroir GitHub Pages)

---

## 🎯 Essentiels — à finir avant de dire « c'est bon »

- [x] **Personnaliser « À propos de moi »** — réécrit (alternance, polyvalent, hardware/bidouille, auto-hébergement, Japon) + rendu visible via une icône bureau (ta photo) en plus du menu Démarrer.
- [ ] **PushPile & Décibulles** — les 2 seuls projets sans visuel. Au minimum : une capture d'écran ou un extrait de sortie, sinon ils paraissent vides à côté des autres. (PushPile : capture de la sortie du compilateur ; Décibulles : capture de l'alerte email / du script.)
- [x] **Aperçu social (Open Graph)** — image `og.jpg` (carte avec ta photo, ton titre, l'URL, taskbar XP) + balises meta OG/Twitter. Preview soignée au partage LinkedIn/mail.
- [x] **Favicon propre** — favicon aux couleurs du logo Windows XP (`favicon.ico` + `.png`).
- [ ] **Test multi-navigateurs** — vérifier sur Chrome, Firefox, Edge (pas que Safari) : surtout les iframes IE, la vidéo, le rendu général.
- [ ] **Passe mobile globale** — vérifier icônes, taskbar, fenêtres, menu Démarrer sur téléphone (pas juste la visionneuse). Décider si on veut à terme un shell mobile façon « iPhone 3G » (idée future).

## ✨ Polish — les détails qui font pro

- [ ] **Clippy** — l'assistant qui apparaît et guide vers le profil caché (charme + met en valeur le concept « fouiner »).
- [ ] **Menu contextuel clic droit** sur le bureau (Actualiser, Propriétés… décoratif mais immersif).
- [ ] **Cohérence visuelle & accessibilité clavier** — petite relecture (focus visible, navigation Tab dans les fenêtres).
- [ ] **README du dépôt GitHub** — le soigner : le repo lui-même est un morceau de portfolio pour un recruteur tech.

## 🎮 Fun / optionnel — si le temps et l'envie

- [ ] Son de démarrage (coupé par défaut, avec un interrupteur).
- [ ] Démineur jouable.
- [ ] **Terminal-compilateur PushPile** — le gros morceau, parké en « v2 ». Faisable (Java tourne sur l'Atom), mais coûteux. Excellent sujet d'entretien même non fini.

---

## Ordre conseillé

1. Personnaliser « À propos de moi » (rapide, gros impact).
2. Aperçu social + favicon (soigne la première impression au partage).
3. PushPile & Décibulles (compléter les projets vides).
4. Passe mobile + multi-navigateurs (fiabilité).
5. Clippy (le petit plus qui fait sourire).
6. Le reste selon l'envie.
