# Interface web TradingAgents

Cette application est entièrement isolée dans `web_ui/`. Elle importe
TradingAgents comme une bibliothèque et ne modifie ni le CLI ni le framework.

## Lancement

Double-cliquez sur `start.command`, ou lancez :

```bash
cd web_ui
npm install
npm run build
cd ..
.venv/bin/python web_ui/server.py
```

Puis ouvrez <http://127.0.0.1:8787>.

Ollama doit être actif et le modèle `qwen3:8b` doit être installé.

Les niveaux Rapide, Moyenne et Approfondie appliquent aussi un budget de sortie
croissant au modèle local. Cela évite qu’un agent monopolise Ollama avec une
réponse interminable, tout en laissant davantage de place aux analyses profondes.

## Sécurité financière

L’interface vérifie le dernier cours de manière déterministe et bloque visuellement
une décision lorsque le modèle propose un prix très éloigné du cours vérifié.
Ce contrôle réduit un risque connu, mais ne transforme pas la sortie en conseil
financier ni en prédiction garantie.
