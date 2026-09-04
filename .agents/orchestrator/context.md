# Context — TradingAgents Light & Dark Theme Harmonization

## Project Root
`/Users/etienne/Documents/ChatGPT/TradingAgents`

## User Constraints & Rules
- Dispatch-only orchestrator (never write code directly, never run builds/tests directly, delegate to subagents).
- Do NOT restart the Python backend server.
- All 34 JS tests (`npm test`) and 31 Python tests (`pytest`) must pass.
- Vite build (`npm run build`) must compile with 0 errors.
- Theme switching must be instant and clean without residual dark containers in light mode or contrast regressions in dark mode.
- Style: Modern SaaS (Linear / Stripe inspired).
