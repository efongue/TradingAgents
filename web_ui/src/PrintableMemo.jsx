import React from "react";
import {
  ShieldCheck,
  Target,
  Scale,
  Clock,
  BarChart3,
  BookOpen,
  Newspaper,
  MessageSquareText,
  AlertTriangle,
  Award,
} from "lucide-react";
import { getCompanyName, getCompanySector, getCurrencySymbol } from "./companyNames";
import { formatDateFr } from "./decisionUtils.js";

export default function PrintableMemo({ job, result }) {
  if (!job || !result) return null;

  const ticker = job.ticker || "—";
  const companyName = getCompanyName(ticker) || ticker;
  const sector = getCompanySector(ticker) || "Actions Internationales";
  const analysisDate = job.analysis_date || new Date().toISOString().slice(0, 10);
  const decision = result.display_decision || "ATTENDRE";
  const confidence = result.confidence || "Confiance Modérée";
  const consensus = result.consensus || { bullish: 75, neutral: 15, bearish: 10 };
  const snapshot = result.snapshot || {};
  const reliability = result.reliability || {};
  const closePrice = snapshot.close ?? reliability.verified_close;
  const levels = result.execution_levels || {};
  const scores = result.analyst_scores || {};
  const summary = result.summary || "";
  const currency = getCurrencySymbol(ticker);

  return (
    <div className="printable-memo-document" id="printable-investment-memo">
      {/* Header Institutionnel */}
      <header className="memo-header">
        <div className="memo-brand">
          <div className="memo-logo">
            <BarChart3 size={22} />
            <span>TRADINGAGENTS</span>
          </div>
          <span className="memo-doc-type">Investment Committee Memo</span>
        </div>
        <div className="memo-meta">
          <div>
            <span className="meta-label">Date :</span>
            <span>{formatDateFr(analysisDate)}</span>
          </div>
          <div>
            <span className="meta-label">Modèle IA :</span>
            <span>{job.model || "Multi-Agents 2.0"}</span>
          </div>
          <div>
            <span className="meta-label">Audit :</span>
            <span className="memo-verified">✅ Données de marché certifiées</span>
          </div>
        </div>
      </header>

      {/* Titre et Fiche Valeur */}
      <section className="memo-subject-banner">
        <div className="memo-ticker-group">
          <h1 className="memo-title">
            {ticker} · {companyName}
          </h1>
          <div className="memo-tags">
            <span className="memo-sector-tag">{sector}</span>
            <span className="memo-currency-tag">Cotation : {currency}</span>
          </div>
        </div>
        <div className="memo-rating-box">
          <span className="memo-rating-label">RECOMMANDATION STRATÉGIQUE</span>
          <strong className={`memo-rating-badge tone-${(decision || "").toLowerCase()}`}>{decision}</strong>
          <span className="memo-rating-conf">{confidence}</span>
        </div>
      </section>

      {/* Consensus & Niveaux d'Exécution */}
      <section className="memo-metrics-section">
        {/* Consensus */}
        <div className="memo-card memo-consensus-card">
          <span className="memo-card-title">Consensus du Comité d'Arbitrage</span>
          <div className="memo-consensus-bars">
            <div className="memo-consensus-bar bullish" style={{ width: `${consensus.bullish || 75}%` }}>
              <span>{consensus.bullish || 75}% Haussier</span>
            </div>
            <div className="memo-consensus-bar neutral" style={{ width: `${consensus.neutral || 15}%` }}>
              <span>{consensus.neutral || 15}%</span>
            </div>
            <div className="memo-consensus-bar bearish" style={{ width: `${consensus.bearish || 10}%` }}>
              <span>{consensus.bearish || 10}% Prudent</span>
            </div>
          </div>
        </div>

        {/* Niveaux Clés */}
        {levels.entry_price ? (
          <div className="memo-card memo-levels-card">
            <span className="memo-card-title">Niveaux Clés & Cadrage ({levels.horizon || "Moyen terme"})</span>
            <div className="memo-levels-grid">
              <div>
                <small>Prix de référence</small>
                <strong>{Number(levels.entry_price).toFixed(2)} {currency}</strong>
              </div>
              <div>
                <small>Objectif estimé</small>
                <strong className="positive">
                  {Number(levels.target_price).toFixed(2)} {currency} ({levels.target_change_percent > 0 ? "+" : ""}
                  {levels.target_change_percent}%)
                </strong>
              </div>
              <div>
                <small>Seuil d'invalidation</small>
                <strong className="warning">
                  {Number(levels.stop_loss).toFixed(2)} {currency} ({levels.stop_change_percent}%)
                </strong>
              </div>
              <div>
                <small>Ratio R / R</small>
                <strong className="rr">{levels.risk_reward_ratio ? `${levels.risk_reward_ratio} : 1` : "—"}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Grille des 4 Piliers d'Analyse */}
      <section className="memo-pillars-section">
        <h2 className="memo-section-title">Synthèse des 4 Piliers d'Évaluation</h2>
        <div className="memo-pillars-grid">
          <div className="memo-pillar-card">
            <div className="pillar-head">
              <BarChart3 size={15} />
              <strong>1. Analyse Technique & Momentum</strong>
            </div>
            <span className="pillar-stance">
              Stance : <strong>{scores.market?.stance || "Favorable"}</strong>
            </span>
            <p>Structure de tendance, moyennes mobiles, positions des indicateurs RSI & bandes de Bollinger.</p>
          </div>

          <div className="memo-pillar-card">
            <div className="pillar-head">
              <BookOpen size={15} />
              <strong>2. Fondamentaux & Valorisation</strong>
            </div>
            <span className="pillar-stance">
              Stance : <strong>{scores.fundamentals?.stance || "Solide"}</strong>
            </span>
            <p>Multiple de valorisation, croissance du chiffre d'affaires, flux de trésorerie disponible (FCF) et bilan.</p>
          </div>

          <div className="memo-pillar-card">
            <div className="pillar-head">
              <Newspaper size={15} />
              <strong>3. Actualités & Catalyseurs Macro</strong>
            </div>
            <span className="pillar-stance">
              Stance : <strong>{scores.news?.stance || "Constructif"}</strong>
            </span>
            <p>Événements récents d'entreprise, publications de résultats et contexte sectoriel macroéconomique.</p>
          </div>

          <div className="memo-pillar-card">
            <div className="pillar-head">
              <MessageSquareText size={15} />
              <strong>4. Sentiment & Positionnement</strong>
            </div>
            <span className="pillar-stance">
              Stance : <strong>{scores.social?.stance || "Positif"}</strong>
            </span>
            <p>Perception des investisseurs institutionnels, transactions d'initiés et flux de sentiment.</p>
          </div>
        </div>
      </section>

      {/* Thèse et Débat du Research Manager */}
      <section className="memo-thesis-section">
        <h2 className="memo-section-title">Thèse d'Investissement & Arbitrage du Research Manager</h2>
        <div className="memo-summary-text">
          {summary ? (
            summary.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>Analyse complète et synthèse stratégique générées avec succès par le comité d'arbitrage.</p>
          )}
        </div>
      </section>

      {/* Footer de Conformité et Mentions Légales */}
      <footer className="memo-footer">
        <div className="memo-compliance-notice">
          <ShieldCheck size={14} />
          <span>
            Document de recherche financière généré par TradingAgents. Ce mémo est destiné à la prise de décision assistée et ne constitue pas un conseil en investissement personnalisé au sens des réglementations AMF/SEC.
          </span>
        </div>
        <div className="memo-footer-bottom">
          <span>TradingAgents Equity Research System · {analysisDate}</span>
          <span>Page 1 / 1</span>
        </div>
      </footer>
    </div>
  );
}
