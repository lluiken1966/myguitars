#!/usr/bin/env bash
# Runs on the server. Invoke via ssh-deploy.sh from your laptop.
set -euo pipefail

REMOTE_DIR="/home/leon/myguitars"

cd "$REMOTE_DIR"

echo "── Pulling latest code"
git pull --ff-only

echo "── Installing dependencies"
npm ci --omit=dev

echo "── Building"
npm run build

echo "── Restarting application"
sudo systemctl restart myguitars

echo "✓ Deploy complete"
