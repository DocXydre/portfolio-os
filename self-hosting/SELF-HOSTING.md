# Auto-hébergement — serveur en baie (Atom + Debian), plusieurs sites, mise à jour à distance

Architecture retenue :

- **L'Atom ne compile jamais.** Il ne fait que servir des fichiers statiques.
- **Mise à jour depuis n'importe où** : `git push` → GitHub Actions compile →
  pousse le résultat sur le serveur en SSH (rsync). Rien à faire en LAN.
- **Plusieurs sites** sur la même machine : **Caddy** en façade, un bloc de
  config + un certificat HTTPS automatique par domaine.

```
  ton PC (n'importe où)          GitHub                     Freebox Pop        Atom / Debian
  ┌───────────────┐   git push   ┌─────────┐   rsync SSH    ┌──────────┐  :443  ┌──────────────┐
  │  code source  │ ───────────► │ Actions │ ─────────────► │ redirect │ ─────► │ Caddy → sites │
  └───────────────┘   (build ici)└─────────┘                └──────────┘        └──────────────┘
```

---

## 1. Débloquer l'auto-hébergement sur la Freebox Pop (IPv4 full-stack)

Par défaut la Freebox Pop partage ton IPv4 (CGNAT) : impossible d'ouvrir 80/443.
La correction est **gratuite** :

1. Espace abonné Free → **Ma Freebox → « Demander une adresse IP fixe V4 full-stack »**.
2. Redémarre la Freebox pour récupérer la nouvelle IP (actif en ~30 min).
3. Vérifie : l'IP « WAN » de la Freebox = celle affichée sur whatismyip.com.

Tu as aussi l'**IPv6 native** en full ; Caddy servira en IPv4 + IPv6 sans rien faire.

## 2. Installer Debian 13 (minimal) sur l'Atom

ISO **Debian 13 netinst amd64** (l'Atom 230 est bien 64 bits). À l'install :
décoche l'environnement de bureau, garde « SSH server » + utilitaires standard.
Fige l'IP locale (réservation DHCP dans la Freebox).

## 3. Durcir le SSH (le serveur sera exposé)

```bash
# Sur l'Atom : clé publique de déploiement autorisée (voir §5)
mkdir -p ~/.ssh && chmod 700 ~/.ssh
# colle la clé publique dans ~/.ssh/authorized_keys

sudo apt update && sudo apt install -y fail2ban ufw rsync
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?Port 22/Port 2222/' /etc/ssh/sshd_config   # port SSH non standard
sudo systemctl restart ssh
sudo ufw allow 2222/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

## 4. Redirections de ports dans la Freebox OS

`mafreebox.freebox.fr` → Gestion des ports → rediriger vers l'IP locale de l'Atom :

- **80 → 80** et **443 → 443** (web + certificats)
- **2222 → 2222** (SSH de déploiement)

## 5. Installer Caddy + le multi-sites

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

sudo mkdir -p /var/www/portfolio && sudo chown -R "$USER":caddy /var/www/portfolio
```

Copie le `Caddyfile` de ce dossier vers `/etc/caddy/Caddyfile`, mets tes domaines,
puis `sudo systemctl reload caddy`. Chaque bloc = un site, certificat auto.

## 6. Domaine(s)

- Simple/gratuit : un sous-domaine **DuckDNS** par site + cron de mise à jour d'IP.
- Plus propre : un vrai nom de domaine (~10 €/an) avec des sous-domaines
  (`portfolio.`, `projet2.`, `api.`) pointant vers ton IP full-stack.

## 7. Déploiement automatique « depuis n'importe où »

Le workflow `.github/workflows/deploy-selfhost.yml` fait tout à chaque `git push`.
Il faut lui donner 5 secrets dans **GitHub → Settings → Secrets and variables →
Actions** :

| Secret | Exemple | Rôle |
|---|---|---|
| `DEPLOY_HOST` | `portfolio.ton-domaine.fr` | hôte du serveur |
| `DEPLOY_PORT` | `2222` | port SSH (celui du §3) |
| `DEPLOY_USER` | `thomas` | utilisateur SSH |
| `DEPLOY_PATH` | `/var/www/portfolio` | dossier servi par Caddy |
| `DEPLOY_SSH_KEY` | *(clé privée)* | clé de déploiement (voir ci-dessous) |

Génère une paire de clés dédiée au déploiement :

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""
# deploy_key.pub  -> à coller dans ~/.ssh/authorized_keys sur l'Atom
# deploy_key      -> à coller dans le secret DEPLOY_SSH_KEY
```

Ensuite : `git push` depuis n'importe quelle machine → le site se met à jour tout seul.

---

## Alternative si tu ne veux pas ouvrir de ports : tunnel Cloudflare

Si tu préfères ne rien exposer (ou si tu gardes le CGNAT), `cloudflared` crée un
tunnel sortant vers Caddy. Aucun port ouvert, HTTPS géré par Cloudflare, et il
gère aussi plusieurs hostnames. Nécessite un domaine géré chez Cloudflare (gratuit).
Dis-le-moi et je te détaille cette variante.

> GitHub Pages peut rester actif en parallèle comme miroir de secours.
