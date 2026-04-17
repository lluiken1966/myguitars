#!/usr/bin/env bash
# Run from your laptop to deploy myguitars to the remote server.
set -euo pipefail

REMOTE_USER="leon"
REMOTE_HOST="217.154.156.4"
REMOTE_DIR="/home/leon/myguitars"
SSH_KEY="/home/stratovps/stratovs"

echo "▶ Deploying to ${REMOTE_USER}@${REMOTE_HOST}"
ssh -t -i "${SSH_KEY}" "${REMOTE_USER}@${REMOTE_HOST}" "bash ${REMOTE_DIR}/deploy.sh"
