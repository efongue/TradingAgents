#!/bin/zsh
echo "Ouverture du tunnel distant Cloudflare pour TradingAgents..."
cloudflared tunnel --url http://127.0.0.1:8787
