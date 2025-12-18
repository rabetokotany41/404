#!/usr/bin/env bash

set -e

IP="192.168.88.89"
DOMAINS=(
  "jenkins.insi.local"
  "traefik.insi.local"
  "gitea.insi.local"
  "notation.insi.local"
)

HOSTS_FILE="/etc/hosts"

echo " Vérification des entrées dans $HOSTS_FILE"

if [[ $EUID -ne 0 ]]; then
  echo "Relance avec sudo..."
  exec sudo "$0" "$@"
fi

for DOMAIN in "${DOMAINS[@]}"; do
  echo -n " $DOMAIN : "
  if grep -qE "^[[:space:]]*$IP[[:space:]]+$DOMAIN([[:space:]]|\$)" "$HOSTS_FILE"; then
    echo "déjà présent "
  else
    echo "$IP    $DOMAIN" >> "$HOSTS_FILE"
    echo "ajouté "
  fi
done

echo "Terminé"
read -rp "Entrée pour quitter..."
