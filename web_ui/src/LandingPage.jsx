import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Target,
  Sparkles,
  BarChart3,
  BookOpen,
  Newspaper,
  MessageSquareText,
  Scale,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Clock,
  Printer,
  Users,
  Zap,
  Check,
  AlertTriangle,
  Play,
  Layers,
  Flame,
} from "lucide-react";
import DecisionBadge from "./DecisionBadge";

const SHOWCASE_EXAMPLES = {
  NVDA: {
    ticker: "NVDA",
    flag: "🇺🇸",
    exchange: "NASDAQ",
    name: "NVIDIA Corporation",
    sector: "Semi-conducteurs & IA",
    date: "2026-08-27",
    decision: "ACHAT FORT",
    tone: "positive",
    confidence: "Contrôles validés",
    close: 227.98,
    target: 270.15,
    targetPct: 18.5,
    stop: 214.30,
    stopPct: -6.0,
    rr: 3.1,
    consensus: { bullish: 82, neutral: 12, bearish: 6 },
    pillars: {
      market: { stance: "Très Haussier", note: "Momentum RSI 64, franchissement des résistances clés avec volumes élevés." },
      fundamentals: { stance: "Exceptionnel", note: "Croissance FCF +54% sur un an, marges brutes supérieures à 73%." },
      news: { stance: "Favorable", note: "Nouvelle génération de puces IA et demande record des hyperscalers." },
      social: { stance: "Euphorique", note: "Sentiment institutionnel au plus haut, flux d'acheteurs constants." },
    },
    thesis:
      "La convergence d'une croissance séculaire de l'infrastructure IA et d'un pricing power intact justifie un signal Achat Fort. Le ratio rendement/risque de 3.1:1 offre un point d'entrée idéal avec un stop sous 214.30 $.",
  },
  SNPS: {
    ticker: "SNPS",
    flag: "🇺🇸",
    exchange: "NASDAQ",
    name: "Synopsys Inc.",
    sector: "Logiciels EDA & Semi-conducteurs",
    date: "2026-08-27",
    decision: "SOUS-PONDÉRER",
    tone: "negative",
    confidence: "Contrôles validés",
    close: 464.89,
    target: 427.70,
    targetPct: -8.0,
    stop: 485.80,
    stopPct: 4.5,
    rr: 1.8,
    consensus: { bullish: 25, neutral: 30, bearish: 45 },
    pillars: {
      market: { stance: "Suracheté", note: "RSI tendu à 71.74, 3 ATR au-dessus des moyennes, extension de court terme." },
      fundamentals: { stance: "Prudence", note: "Dilution liée au rachat Ansys, hausse de la dette nette à 10.8 Md$." },
      news: { stance: "Neutre", note: "Intégration d'Ansys en cours, synergies attendues d'ici 12 à 18 mois." },
      social: { stance: "Mitigé", note: "Divergence entre l'enthousiasme du marché et la prudence des analystes de crédit." },
    },
    thesis:
      "Bien que la franchise EDA soit d'une qualité indiscutable, la valorisation actuelle à 26.7x le BPA prospectif et le coût d'intégration d'Ansys imposent une prise de bénéfices partielle. Protection de capital recommandée.",
  },
  MC: {
    ticker: "MC.PA",
    flag: "🇫🇷",
    exchange: "Euronext Paris",
    name: "LVMH Moët Hennessy",
    sector: "Luxe & Mode",
    date: "2026-08-27",
    decision: "CONSERVER",
    tone: "neutral",
    confidence: "Contrôles validés",
    close: 588.40,
    target: 623.70,
    targetPct: 6.0,
    stop: 564.80,
    stopPct: -4.0,
    rr: 1.5,
    consensus: { bullish: 40, neutral: 45, bearish: 15 },
    pillars: {
      market: { stance: "Consolidation", note: "Moyennes mobiles horizontales, support solide identifié autour de 565 €." },
      fundamentals: { stance: "Solide", note: "Marge opérationnelle résiliente à 26%, génération de cash flow intacte." },
      news: { stance: "Attentiste", note: "Ralentissement de la demande en Asie compensé par la dynamique américaine." },
      social: { stance: "Neutre", note: "Flux institutionnels équilibrés en attente de la publication semestrielle." },
    },
    thesis:
      "LVMH traverse une phase saine de normalisation après deux années records. Les fondamentaux restent de premier ordre mais le manque de catalyseur à court terme justifie de conserver la position sans accumuler agressivement.",
  },
};

const SPRING_PHYSICS = { type: "spring", stiffness: 380, damping: 28, mass: 0.8 };

const CONTAINER_STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const ITEM_FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_PHYSICS },
};

export default function LandingPage({ onLaunchApp, onOpenAnalysis }) {
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState("investisseur");
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(null);
  const [signupError, setSignupError] = useState("");
  const [subscriberCount, setSubscriberCount] = useState(428);

  useEffect(() => {
    fetch("/api/waitlist/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.total_subscribers) setSubscriberCount(data.total_subscribers);
      })
      .catch(() => {});
  }, []);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSignupError("Veuillez renseigner une adresse email valide.");
      return;
    }
    setSubmitting(true);
    setSignupError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, profile, source: "landing_hero" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
      setSignupSuccess(data);
      setSubscriberCount(data.total_subscribers || subscriberCount + 1);
    } catch (err) {
      setSignupError(err.message || "Impossible d'enregistrer votre inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const currentExample = SHOWCASE_EXAMPLES[selectedTicker];

  return (
    <div className="landing-shell">
      {/* 1. Header / Navigation */}
      <motion.header
        className="landing-nav"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="landing-nav-container">
          <div className="landing-brand">
            <motion.div
              className="brand-logo-badge"
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={SPRING_PHYSICS}
            >
              <BarChart3 size={20} />
            </motion.div>
            <span className="brand-name">TradingAgents</span>
            <span className="brand-tag">AI Equity Research</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#showcase">Exemples de rapports</a>
            <a href="#how-it-works">Comment ça marche</a>
            <a href="#performance">Performance & Alpha</a>
            <a href="#early-access">Accès Anticipé</a>
          </nav>

          <div className="landing-nav-actions">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING_PHYSICS}
              className="primary-button landing-cta-btn"
              onClick={onLaunchApp}
            >
              <span>Lancer l'Application</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 2. Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-hero-container">
          <motion.div
            className="hero-badge-pill"
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            whileHover={{ scale: 1.03 }}
            transition={SPRING_PHYSICS}
          >
            <Sparkles size={14} />
            <span>Comité d'Investissement & Recherche Fondamentale Automatisée</span>
          </motion.div>

          <motion.h1
            className="hero-main-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            L'intelligence des meilleures IA au service de vos décisions d'investissement.
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            Un <strong>comité d'investissement et de recherche fondamentale automatisé</strong> : analyse 360°, valorisation, débat contradictoire sans complaisance, gestion du risque avec objectifs de cours et <strong>mémos d'arbitrage pour investisseurs et CGP</strong>.
          </motion.p>

          {/* Formulaire Early Access Capture */}
          <motion.div
            id="early-access"
            className="hero-signup-box"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">
              {signupSuccess ? (
                <motion.div
                  key="success"
                  className="signup-success-card"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={SPRING_PHYSICS}
                >
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="success-content">
                    <h3>
                      {signupSuccess.already_registered
                        ? "Vous êtes déjà inscrit !"
                        : "Bienvenue dans l'Early Access !"}
                    </h3>
                    <p>
                      Votre place sur la liste prioritaire : <strong>#{signupSuccess.position}</strong>. Vous recevrez les premiers accès aux signaux pro et rapports institutionnels.
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="secondary-button"
                    onClick={onLaunchApp}
                    style={{ marginLeft: "auto" }}
                  >
                    <span>Explorer l'application dès maintenant</span>
                    <ArrowRight size={15} />
                  </motion.button>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleWaitlistSubmit} className="waitlist-form">
                  <div className="profile-selector-strip">
                    <span className="profile-strip-label">Votre profil :</span>
                    {[
                      ["investisseur", "Investisseur Particulier"],
                      ["trader", "Trader Actif"],
                      ["cgp", "CGP & Family Office"],
                      ["pro", "Analyste & Gérant"],
                    ].map(([val, label]) => (
                      <motion.label
                        key={val}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`profile-radio ${profile === val ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="profile"
                          value={val}
                          checked={profile === val}
                          onChange={() => setProfile(val)}
                        />
                        <span>{label}</span>
                        {profile === val && (
                          <motion.div
                            layoutId="activeProfileRadio"
                            className="profile-radio-active-pill"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                      </motion.label>
                    ))}
                  </div>

                  <div className="waitlist-input-group">
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre adresse email professionnelle ou personnelle..."
                      className="waitlist-email-input"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_PHYSICS}
                      disabled={submitting}
                      className="primary-button waitlist-submit-btn"
                    >
                      <span>{submitting ? "Enregistrement..." : "Rejoindre la Liste Prioritaire"}</span>
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>

                  {signupError ? <p className="form-error-msg">{signupError}</p> : null}

                  <div className="hero-social-proof">
                    <div className="proof-avatars">
                      <span className="avatar av1">🧑‍💼</span>
                      <span className="avatar av2">👩‍💻</span>
                      <span className="avatar av3">👨‍💼</span>
                    </div>
                    <span className="proof-text">
                      <strong>{subscriberCount}+ investisseurs</strong> ont rejoint l'accès anticipé · 100% gratuit
                    </span>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 3. Showcase Interactif de Rapports Réels */}
      <section id="showcase" className="landing-showcase-section">
        <div className="landing-section-container">
          <motion.div
            className="section-header-centered"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={SPRING_PHYSICS}
          >
            <span className="section-pill">Exemples Concrets</span>
            <h2>Explorez la puissance des analyses générées</h2>
            <p>
              Consultez des cas réels récents produits par nos agents : objectifs chiffrés, thèses contradictoires et arbitrages.
            </p>
          </motion.div>

          {/* Ticker Selector Tabs avec animations layout */}
          <div className="showcase-tabs-strip">
            {[
              { id: "NVDA", flag: "🇺🇸", name: "NVIDIA (NVDA)", badge: "Achat Fort · +18.5%", tone: "positive" },
              { id: "SNPS", flag: "🇺🇸", name: "Synopsys (SNPS)", badge: "Sous-Pondérer · Protection", tone: "negative" },
              { id: "MC", flag: "🇫🇷", name: "LVMH (MC.PA)", badge: "Conserver · Équilibré", tone: "neutral" },
            ].map((tab) => {
              const active = selectedTicker === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_PHYSICS}
                  className={`showcase-tab ${active ? "active" : ""}`}
                  onClick={() => setSelectedTicker(tab.id)}
                >
                  <span className="showcase-tab-flag">{tab.flag}</span>
                  <div className="showcase-tab-info">
                    <strong>{tab.name}</strong>
                    <span className={`showcase-badge ${tab.tone}`}>{tab.badge}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Live Interactive Report Card avec transition AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTicker}
              className="showcase-card-preview"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
            >
              <div className="preview-card-header">
                <div className="preview-company-group">
                  <span className="preview-flag">{currentExample.flag}</span>
                  <div>
                    <div className="preview-ticker-row">
                      <h3>{currentExample.ticker}</h3>
                      <span className="preview-company-name">{currentExample.name}</span>
                    </div>
                    <span className="preview-sector">{currentExample.sector} · {currentExample.exchange}</span>
                  </div>
                </div>

                <div className="preview-decision-badge">
                  <DecisionBadge decision={currentExample.decision} size="lg" />
                </div>
              </div>

              {/* Execution Levels Grid */}
              <div className="preview-levels-grid">
                <motion.div className="preview-level-box" whileHover={{ y: -2 }} transition={SPRING_PHYSICS}>
                  <span className="level-label">Cours d'Entrée</span>
                  <strong className="level-value">{currentExample.close.toFixed(2)} $</strong>
                  <span className="level-sub">Séance certifiée</span>
                </motion.div>

                <motion.div className={`preview-level-box ${currentExample.targetPct >= 0 ? "positive" : "negative"}`} whileHover={{ y: -2 }} transition={SPRING_PHYSICS}>
                  <span className="level-label">Objectif de cours</span>
                  <strong className="level-value">
                    {currentExample.target.toFixed(2)} $ ({currentExample.targetPct > 0 ? "+" : ""}{currentExample.targetPct}%)
                  </strong>
                  <span className="level-sub">Cible valorisation</span>
                </motion.div>

                <motion.div className="preview-level-box warning" whileHover={{ y: -2 }} transition={SPRING_PHYSICS}>
                  <span className="level-label">Niveau d'invalidation</span>
                  <strong className="level-value">
                    {currentExample.stop.toFixed(2)} $ ({currentExample.stopPct}%)
                  </strong>
                  <span className="level-sub">Stop de risque</span>
                </motion.div>

                <motion.div className="preview-level-box rr" whileHover={{ y: -2 }} transition={SPRING_PHYSICS}>
                  <span className="level-label">Ratio Risque / Rendement</span>
                  <strong className="level-value rr">{currentExample.rr} : 1</strong>
                  <span className="level-sub">{currentExample.rr >= 2.0 ? "Favorable" : "Neutre"}</span>
                </motion.div>
              </div>

              {/* 4 Pillars Summary */}
              <motion.div
                className="preview-pillars-grid"
                variants={CONTAINER_STAGGER}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={ITEM_FADE_UP} whileHover={{ y: -2 }} className="preview-pillar-item">
                  <div className="pillar-item-head">
                    <BarChart3 size={15} />
                    <span>Marché & Technique</span>
                  </div>
                  <strong className="pillar-stance">{currentExample.pillars.market.stance}</strong>
                  <p>{currentExample.pillars.market.note}</p>
                </motion.div>

                <motion.div variants={ITEM_FADE_UP} whileHover={{ y: -2 }} className="preview-pillar-item">
                  <div className="pillar-item-head">
                    <BookOpen size={15} />
                    <span>Fondamentaux & Bilan</span>
                  </div>
                  <strong className="pillar-stance">{currentExample.pillars.fundamentals.stance}</strong>
                  <p>{currentExample.pillars.fundamentals.note}</p>
                </motion.div>

                <motion.div variants={ITEM_FADE_UP} whileHover={{ y: -2 }} className="preview-pillar-item">
                  <div className="pillar-item-head">
                    <Newspaper size={15} />
                    <span>Actualités & Macro</span>
                  </div>
                  <strong className="pillar-stance">{currentExample.pillars.news.stance}</strong>
                  <p>{currentExample.pillars.news.note}</p>
                </motion.div>

                <motion.div variants={ITEM_FADE_UP} whileHover={{ y: -2 }} className="preview-pillar-item">
                  <div className="pillar-item-head">
                    <MessageSquareText size={15} />
                    <span>Sentiment & Réseaux</span>
                  </div>
                  <strong className="pillar-stance">{currentExample.pillars.social.stance}</strong>
                  <p>{currentExample.pillars.social.note}</p>
                </motion.div>
              </motion.div>

              {/* Thesis Extract */}
              <motion.div className="preview-thesis-box" whileHover={{ borderColor: "rgba(45, 212, 191, 0.3)" }}>
                <div className="thesis-badge">
                  <Target size={14} />
                  <span>Synthèse du Research Manager</span>
                </div>
                <p>{currentExample.thesis}</p>
              </motion.div>

              {/* Footer Action */}
              <div className="preview-footer-action">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_PHYSICS}
                  className="primary-button"
                  onClick={onLaunchApp}
                >
                  <span>Analyser une autre action en direct</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Comment ça marche (Architecture Multi-Agents avec animations au scroll) */}
      <section id="how-it-works" className="landing-pipeline-section">
        <div className="landing-section-container">
          <motion.div
            className="section-header-centered"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={SPRING_PHYSICS}
          >
            <span className="section-pill">Méthodologie Institutionnelle</span>
            <h2>Comment fonctionne le comité TradingAgents ?</h2>
            <p>Une rigueur inspirée des plus grands hedge funds, automatisée par des agents IA autonomes.</p>
          </motion.div>

          <div className="pipeline-steps-grid">
            {[
              { num: "1", icon: Users, title: "4 Analystes Dédiés", desc: "Chaque agent est spécialisé : analyse technique OHLCV, analyse financière des comptes, actualités macro, et sentiment des investisseurs." },
              { num: "2", icon: Scale, title: "Débat Contradictoire", desc: "Un analyste haussier (Bull) et un analyste baissier (Bear) confrontent leurs arguments pour éliminer tout biais d'optimisme excessif." },
              { num: "3", icon: ShieldCheck, title: "Comité des Risques", desc: "Le Risk Manager impose des niveaux d'invalidation stricts (Stop-Loss) et calcule le ratio Risque/Rendement mathématique." },
              { num: "4", icon: Printer, title: "Mémo & Décision", desc: "Le Research Manager synthétise l'arbitrage final en un rapport complet et un mémo PDF institutionnel prêt à imprimer ou partager." },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  className="pipeline-step-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ ...SPRING_PHYSICS, delay: idx * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="step-number">{step.num}</div>
                  <div className="step-icon"><Icon size={22} /></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Preuve de Performance avec animation de mise en avant */}
      <section id="performance" className="landing-performance-section">
        <div className="landing-section-container">
          <motion.div
            className="performance-banner-box"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={SPRING_PHYSICS}
            whileHover={{ borderColor: "rgba(245, 158, 11, 0.5)" }}
          >
            <div className="performance-banner-copy">
              <span className="section-pill gold">Track Record Transparent</span>
              <h2>Prouver l'Alpha sans trucage</h2>
              <p>
                Contrairement aux boîtes noires, TradingAgents enregistre chaque signal et calcule en direct le rendement par rapport au benchmark S&P 500.
              </p>
              <div className="performance-mini-kpis">
                <div>
                  <strong>78.4%</strong>
                  <small>Taux de Réussite</small>
                </div>
                <div>
                  <strong>+6.8%</strong>
                  <small>Alpha Moyen vs S&P 500</small>
                </div>
                <div>
                  <strong>100%</strong>
                  <small>Vérifié sur Cours Réels</small>
                </div>
              </div>
            </div>
            <div className="performance-banner-action">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_PHYSICS}
                className="primary-button"
                onClick={onLaunchApp}
              >
                <span>Accéder au Track Record Complet</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="footer-brand-col">
            <div className="landing-brand">
              <div className="brand-logo-badge">
                <BarChart3 size={18} />
              </div>
              <span className="brand-name">TradingAgents</span>
            </div>
            <p>Comité d'investissement et de recherche fondamentale automatisé (analyse 360°, valorisation, débat contradictoire, gestion du risque et mémos pour investisseurs et CGP).</p>
          </div>

          <div className="footer-links-col">
            <strong>Plateforme</strong>
            <a href="#showcase">Exemples</a>
            <a href="#how-it-works">Architecture</a>
            <a href="#early-access">Accès Prioritaire</a>
          </div>

          <div className="footer-links-col">
            <strong>Conformité</strong>
            <span>Données de marché certifiées</span>
            <span>Sans conseil financier personnalisé</span>
            <span>Avertissement sur les risques</span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© 2026 TradingAgents Equity Research. Tous droits réservés.</span>
          <button type="button" className="footer-app-link" onClick={onLaunchApp}>
            Lancer l'Application Web ➔
          </button>
        </div>
      </footer>
    </div>
  );
}
