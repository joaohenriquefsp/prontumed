#!/usr/bin/env bash
# Registra todos os conectores Debezium via REST API.
# Execute após o docker compose estar de pé:
#   bash infra/debezium/register-connectors.sh

set -euo pipefail

CONNECT_URL="http://localhost:8083"
CONNECTORS_DIR="$(cd "$(dirname "$0")/connectors" && pwd)"

echo "Aguardando Debezium Connect ficar pronto..."
until curl -sf "$CONNECT_URL/" > /dev/null; do
  echo "  ainda iniciando..."
  sleep 3
done
echo "Debezium Connect pronto."
echo ""

for connector_file in "$CONNECTORS_DIR"/*.json; do
  name=$(basename "$connector_file" .json)
  echo "Registrando: $name"

  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$CONNECT_URL/connectors" \
    -H "Content-Type: application/json" \
    -d @"$connector_file")

  if [ "$status" = "201" ]; then
    echo "  OK — criado (201)"
  elif [ "$status" = "409" ]; then
    echo "  OK — já existe (409), atualizando config..."
    curl -s -X PUT "$CONNECT_URL/connectors/$name/config" \
      -H "Content-Type: application/json" \
      -d "$(jq '.config' "$connector_file")" > /dev/null
    echo "  config atualizada"
  else
    echo "  ERRO — HTTP $status"
    exit 1
  fi
done

echo ""
echo "Conectores registrados. Status:"
curl -s "$CONNECT_URL/connectors?expand=status" | jq -r 'to_entries[] | "\(.key): \(.value.status.connector.state)"'
