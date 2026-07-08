#!/usr/bin/env sh
set -eu

MINIO_CONTAINER="${MINIO_CONTAINER:-innogram-minio}"
S3_BUCKET="${S3_BUCKET:-innogram-files}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"

NETWORK_NAME="$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$MINIO_CONTAINER" | head -n 1)"

if [ -z "$NETWORK_NAME" ]; then
  echo "Cannot detect Docker network for $MINIO_CONTAINER" >&2
  exit 1
fi

docker run --rm \
  --network "$NETWORK_NAME" \
  -e MINIO_ROOT_USER="$MINIO_ROOT_USER" \
  -e MINIO_ROOT_PASSWORD="$MINIO_ROOT_PASSWORD" \
  -e S3_BUCKET="$S3_BUCKET" \
  minio/mc:RELEASE.2025-04-16T18-13-26Z \
  sh -c 'mc alias set innogram http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" && mc mb --ignore-existing innogram/"$S3_BUCKET"'
