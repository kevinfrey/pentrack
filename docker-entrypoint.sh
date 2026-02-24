#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/data}"

# Ensure persistent directories exist on the mounted volume
mkdir -p "${DATA_DIR}/uploads"

# Symlink public/uploads → persistent volume so Next.js serves uploads normally
rm -rf /app/public/uploads
ln -sf "${DATA_DIR}/uploads" /app/public/uploads

exec "$@"
