# Phase 1 — Installer Debian 12 sur l'Atom (base du serveur)

Objectif : un Debian minimal, sans bureau, accessible en SSH. **Tout en DHCP**
pour l'instant : le serveur est sur un switch temporaire, il sera déplacé ensuite.
En DHCP, le déménagement est transparent (il reprend une IP sur le réseau final).

Matériel pour l'install : l'Atom + écran + clavier + une clé USB (≥ 1 Go) + le
câble réseau branché au switch (pour que le DHCP fonctionne).

---

## 1. Créer la clé USB d'installation (depuis le Mac)

1. Télécharge l'image **Debian 12 netinst amd64** :
   <https://www.debian.org/distrib/> → « Petits CD » → `amd64` →
   `debian-12.x.x-amd64-netinst.iso`
   (L'image standard inclut désormais les firmwares — utile pour la carte réseau
   de l'Atom.)

2. Écris-la sur la clé. Le plus simple : **balenaEtcher**
   (<https://etcher.balena.io>) → sélectionne l'ISO → la clé → Flash.

   *Ou en ligne de commande (attention à bien viser le bon disque) :*
   ```bash
   diskutil list                      # repère la clé, ex. /dev/disk4
   diskutil unmountDisk /dev/disk4
   sudo dd if=~/Downloads/debian-12.x.x-amd64-netinst.iso of=/dev/rdisk4 bs=4m status=progress
   diskutil eject /dev/disk4
   ```

## 2. Démarrer l'Atom sur la clé

- Branche la clé, allume, appuie sur la touche du **menu de boot** (souvent
  `F12`, `F11`, `Esc` ou `F8` selon la carte mère) et choisis la clé USB.
- Si rien : entre dans le **BIOS** (`Suppr`/`F2`), mets l'USB en premier dans
  l'ordre de boot, règle le SATA en **AHCI** si l'option existe, sauvegarde.
- Au menu Debian, choisis **Install** (l'installateur texte, plus léger que
  « Graphical install » — parfait pour 2 Go de RAM).

## 3. Dérouler l'installateur

- **Langue / pays / clavier** : Français / France / Français.
- **Réseau** : laisse faire le **DHCP** (ne configure rien à la main).
- **Nom de machine (hostname)** : ex. `baie-srv01`.
- **Domaine** : laisse **vide**.
- **Mot de passe root** : tu peux le **laisser vide** → l'installateur créera à la
  place un utilisateur avec les droits `sudo` (recommandé et plus propre).
- **Utilisateur** : crée `thomas` avec un bon mot de passe (ce sera ton compte SSH).
- **Horloge** : Europe/Paris.
- **Partitionnement** : **« Assisté – utiliser un disque entier »**, tout dans une
  seule partition (simple), le disque de 150 Go → « Terminer le partitionnement ».
- **Miroir / paquets** : miroir France (deb.debian.org convient), pas de proxy.
- **Popularity contest** : Non.
- **Choix des logiciels (tasksel)** — étape clé, **décoche tout sauf** :
  - ❌ environnement de bureau (aucun)
  - ✅ **serveur SSH**
  - ✅ **utilitaires usuels du système**
- **GRUB** : installe-le sur le disque principal (`/dev/sda`).
- Redémarre, **retire la clé**.

## 4. Premier démarrage et accès SSH

Sur l'Atom (écran/clavier), connecte-toi en `thomas`, puis :

```bash
ip a                       # note l'adresse IPv4 (ex. 192.168.0.42) de l'interface enpXsX
sudo apt update && sudo apt -y full-upgrade
sudo apt install -y sudo curl rsync
```

Depuis le Mac, sur le même réseau :

```bash
ssh thomas@192.168.0.42
```

À partir de là tu peux débrancher écran/clavier : tout se fait en SSH (headless).

## 5. Réglages de base

```bash
sudo timedatectl set-timezone Europe/Paris
sudo hostnamectl set-hostname baie-srv01
```

Active les mises à jour de sécurité automatiques (tranquillité) :

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades   # répondre "Oui"
```

---

## Quand tu déplaceras le serveur sur son switch définitif

- En DHCP, **rien à refaire** : il reprend une IP sur le nouveau réseau. Rebranche,
  puis retrouve son IP (console `ip a`, ou page « appareils » de la Freebox).
- À ce moment-là seulement, fige l'IP : soit une **réservation DHCP** dans la
  Freebox (le plus simple), soit une IP statique dans `/etc/network/interfaces`.
- Le nom d'interface (ex. `enp1s0`) ne change pas (lié au matériel), donc toute
  config réseau reste valable après le déménagement.

➡️ Une fois cette phase faite, on passe à la **Phase 2** : Freebox IPv4 full-stack,
Caddy multi-sites, sécurisation SSH et déploiement automatique (voir `SELF-HOSTING.md`).
