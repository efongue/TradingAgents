#!/bin/zsh
set -e

SCRIPT_DIR="${0:A:h}"
PROJECT_DIR="${SCRIPT_DIR:h}"

cd "$SCRIPT_DIR"

if [[ ! -d node_modules ]]; then
  npm install
fi

npm run build

cd "$PROJECT_DIR"
open "http://127.0.0.1:8787"
exec .venv/bin/python web_ui/server.py

