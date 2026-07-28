#!/usr/bin/env bash
# Déploie le portfolio sur le serveur auto-hébergé (Atom sous Debian).
# À lancer depuis ta machine (Mac), PAS sur l'Atom : la compilation reste ici.
#
#   ./self-hosting/deploy.sh thomas@192.168.1.50
#
# Prérequis côté serveur : dossier /var/www/portfolio existant et accessible
# en écriture à l'utilisateur SSH, et rsync installé (sudo apt install rsync).

set -euo pipefail

SERVER="${1:?Usage: ./deploy.sh user@ip-du-serveur}"
REMOTE_DIR="${2:-/var/www/portfolio}"

echo "→ Build de production (base-href = /)"
npm run build -- --base-href /

echo "→ Envoi vers ${SERVER}:${REMOTE_DIR}"
# --chmod force des permissions lisibles par Caddy (dossiers 755, fichiers 644)
rsync -avz --delete --chmod=D755,F644 dist/portfolio-windowsxp/browser/ "${SERVER}:${REMOTE_DIR}/"

echo "✓ Déployé. (Recharge la page sur ton domaine.)"
