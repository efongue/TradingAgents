# 🚀 Feuille de Route & Spécifications SaaS Multi-Utilisateurs (`todosaas.md`)

Ce document synthétise l'ensemble des prérequis d'architecture, de sécurité, de base de données et de monétisation pour faire évoluer **TradingAgents** d'une station locale vers un **SaaS Cloud multi-utilisateurs sécurisé**.

---

## 🔒 1. Sécurité & Protection contre le Partage / Piratage de Compte

Pour empêcher le vol de session, le partage d'identifiants entre utilisateurs non abonnés ou l'abus de tokens LLM :

### A. Stockage en Cookies `HttpOnly` (Zéro Token dans le `localStorage`)
- [ ] Stocker le jeton de session JWT dans un cookie sécurisé : `HttpOnly; Secure; SameSite=Strict`.
- [ ] **Bénéfice** : Inaccessible en JavaScript $\rightarrow$ protection totale contre les attaques XSS et l'extraction manuelle de jeton.

### B. Session Unique Active (*Single Active Device*)
- [ ] Générer un `session_id` révocable enregistré en base de données / Redis.
- [ ] Lors d'une nouvelle connexion sur un autre appareil, révoquer automatiquement la session précédente (*comportement type Netflix / ChatGPT Plus*).
- [ ] Afficher une notification claire : *« Une nouvelle session a été ouverte sur un autre appareil »*.

### C. Rotation des Refresh Tokens (*Token Rotation & Reuse Detection*)
- [ ] Durée de vie de l'Access Token : **15 minutes**.
- [ ] Refresh Token à usage unique avec rotation systématique.
- [ ] Si un Refresh Token déjà consommé est réutilisé (tentative de vol), invalider immédiatement l'ensemble de la famille de jetons du compte.

### D. Détection d'Anomalies IP & Empreinte (*Fingerprinting*)
- [ ] Vérifier la cohérence de l'adresse IP et du `User-Agent`.
- [ ] En cas de géolocalisation incohérente simultanée (ex: Paris et New York à 2 minutes d'intervalle), suspendre la session et exiger un code 2FA par email.

### E. Quotas & Plafonnement des Coûts LLM
- [ ] Rate-limiting strict par plan (ex: Gratuit = 3 scans/jour, Pro = 50 analyses/mois).
- [ ] Limite budgétaire maximale de tokens par compte pour garantir la rentabilité du SaaS.

---

## 🗄️ 2. Base de Données Relationnelle (PostgreSQL / Supabase)

Migration de la persistance locale (`history.json`, `scans.json`) vers un modèle relationnel :

```sql
-- Utilisateurs & Abonnements
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préférences Utilisateur (Remplace le localStorage local)
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    default_capital NUMERIC(15, 2) DEFAULT 10000.00,
    default_risk_percent NUMERIC(4, 2) DEFAULT 1.00,
    preferred_currency VARCHAR(5) DEFAULT 'EUR',
    sound_alerts_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist Personnalisée
CREATE TABLE user_watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Historique des Analyses
CREATE TABLE user_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    analysis_date DATE NOT NULL,
    decision VARCHAR(50) NOT NULL,
    confidence_tier VARCHAR(20),
    report_json JSONB NOT NULL,
    tokens_consumed INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ⚡ 3. Backend Asynchrone & File d'Attente de Tâches

- [ ] **Framework API** : Migration de `server.py` (`ThreadingHTTPServer`) vers **FastAPI + Uvicorn / Gunicorn**.
- [ ] **Queue de Workers** : Déploiement de **Celery + Redis** (ou BullMQ) :
  - Permet d'exécuter les graphes multi-agents en arrière-plan sans bloquer l'API.
  - Gère les pics de trafic et respecte les quotas des APIs LLM et flux boursiers.
- [ ] **WebSockets / Server-Sent Events (SSE)** : Streaming en direct de la progression de l'analyse (Marché $\rightarrow$ Fondamentaux $\rightarrow$ News $\rightarrow$ Débat) vers le frontend React.

---

## 💳 4. Monétisation & Abonnements (Stripe)

- [ ] Intégration de **Stripe Checkout & Customer Portal**.
- [ ] Webhook Stripe pour provisionner automatiquement les crédits et mettre à jour `plan_tier`.
- [ ] Paliers types :
  - **Free / Découverte** : 3 analyses/jour, scanner limité à 5 titres.
  - **Pro Trader (29 € / mois)** : Analyses illimitées, scanner de marché complet, export IBKR automatique, alertes de signal.
  - **Institutionnel / API** : Accès direct aux webhooks et endpoints d'arbitrage.

---

## 🐳 5. Conteneurisation & Déploiement Cloud

- [ ] `Dockerfile` multi-stage :
  - Stage 1 (Node.js) : `npm run build` du frontend Vite.
  - Stage 2 (Python 3.11 slim) : Installation des dépendances et exécution de l'API FastAPI.
- [ ] `docker-compose.yml` orchestrant l'application, PostgreSQL et Redis.
- [ ] Pipeline CI/CD GitHub Actions avec exécution automatique de la suite de tests (`npm test` + `pytest`).
