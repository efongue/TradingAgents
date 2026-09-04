import React, { useEffect, useMemo, useState, Suspense, lazy, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import {
  CheckCircle2,
  LoaderCircle,
  Play,
  ScanSearch,
} from "lucide-react";
import { api } from "./api.js";
import { formatTokens } from "./Workflow.jsx";
import { useWatchlist } from "./hooks/useWatchlist.js";
import { useAnalysisJob } from "./hooks/useAnalysisJob.js";
import { useScanJob } from "./hooks/useScanJob.js";

// Layout Components
import Sidebar from "./components/layout/Sidebar.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import PipelineGuidePopover from "./components/layout/PipelineGuidePopover.jsx";
import GlobalDisclaimerPopup from "./components/layout/GlobalDisclaimerPopup.jsx";

// Lazy-Loaded Pages for optimal bundle size and Code-Splitting
const AnalysisPage = lazy(() => import("./pages/AnalysisPage.jsx"));
const ResultPage = lazy(() => import("./pages/ResultPage.jsx"));
const HistoryPage = lazy(() => import("./pages/HistoryPage.jsx"));
const PerformancePage = lazy(() => import("./pages/PerformancePage.jsx"));
const ScannerPage = lazy(() => import("./pages/ScannerPage.jsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.jsx"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));

const INITIAL_FORM = {
  ticker: "AAPL",
  date: new Date().toISOString().slice(0, 10),
  depth: 1,
  analysts: [],
};

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: [0.7, 0, 0.84, 0] } },
};

export default function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPage = params.get("page");
    const validPages = ["landing", "analysis", "performance", "scanner", "compare", "watchlist", "history", "models", "settings"];
    if (queryPage && validPages.includes(queryPage)) {
      return queryPage;
    }
    const saved = localStorage.getItem("tradingagents_page");
    return saved && validPages.includes(saved) ? saved : "analysis";
  });

  const [form, setForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker");
    return { ...INITIAL_FORM, ...(ticker ? { ticker: ticker.toUpperCase() } : {}) };
  });

  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({
    online: false,
    models: [],
    endpoint: "",
    active_model: "",
    capabilities: {},
    tradingagents: {},
    analysis: null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [historyJob, setHistoryJob] = useState(null);
  const [capabilities, setCapabilities] = useState({ analysts: [], data_steps: [] });
  const [capabilitiesError, setCapabilitiesError] = useState("");
  const [compareTickers, setCompareTickers] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tickers = params.get("tickers");
    return tickers ? tickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean) : ["NVDA", "MSFT"];
  });
  const [toast, setToast] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }, []);

  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("tradingagents_theme") : null;
    if (saved === "light" || saved === "dark") return saved;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.colorScheme = theme;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("tradingagents_theme", theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const loadHistory = useCallback(async () => {
    try { setHistory((await api("/api/history")).items || []); } catch { setHistory([]); }
  }, []);

  const {
    job,
    setJob,
    isRunning: analysisActive,
    pollWarning,
    submitAnalysis,
    resetJob,
  } = useAnalysisJob({
    onComplete: () => loadHistory(),
  });

  const {
    scanJob,
    setScanJob,
    isRunning: scanActive,
  } = useScanJob({
    onProgress: () => loadHistory(),
    onComplete: () => loadHistory(),
  });

  const { addToWatchlist: addWatchlist } = useWatchlist();

  const activeModel = useMemo(() => status.active_model || status.models?.[0]?.name || "Modèle non détecté", [status]);

  const loadStatus = useCallback(async () => {
    try { setStatus(await api("/api/status")); } catch { setStatus((current) => ({ ...current, online: false })); }
  }, []);

  const loadCapabilities = useCallback(async () => {
    try {
      const payload = await api("/api/capabilities");
      const analysts = Array.isArray(payload.analysts) ? payload.analysts : [];
      const dataSteps = Array.isArray(payload.data_steps) ? payload.data_steps : [];
      const ids = analysts.map((analyst) => analyst.id);
      setCapabilities({ analysts, data_steps: dataSteps });
      setCapabilitiesError("");
      setForm((current) => {
        const selected = current.analysts.filter((id) => ids.includes(id));
        return { ...current, analysts: selected.length ? selected : ids };
      });
    } catch (error) {
      setCapabilities({ analysts: [], data_steps: [] });
      setCapabilitiesError(`Analystes indisponibles : ${error.message}`);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadHistory();
    loadCapabilities();

    api("/api/active")
      .then((activePayload) => {
        if (activePayload?.active_scan) {
          setScanJob(activePayload.active_scan);
        } else {
          const savedScanId = localStorage.getItem("tradingagents_scan_id");
          if (savedScanId) {
            api(`/api/scans/${savedScanId}`).then((s) => setScanJob(s)).catch(() => localStorage.removeItem("tradingagents_scan_id"));
          } else if (activePayload?.latest_scan) {
            setScanJob(activePayload.latest_scan);
          }
        }

        if (activePayload?.active_job) {
          setJob(activePayload.active_job);
        } else {
          const queryTicker = new URLSearchParams(window.location.search).get("ticker");
          const savedJobId = localStorage.getItem("tradingagents_job_id");
          if (savedJobId) {
            api(`/api/jobs/${savedJobId}`).then((j) => {
              if (j?.parent_scan_id) {
                localStorage.removeItem("tradingagents_job_id");
                return;
              }
              if (queryTicker && j?.ticker && j.ticker.toUpperCase() !== queryTicker.toUpperCase()) {
                return;
              }
              setJob(j);
            }).catch(() => localStorage.removeItem("tradingagents_job_id"));
          } else if (activePayload?.latest_job && !activePayload.latest_job.parent_scan_id) {
            if (!queryTicker || (activePayload.latest_job.ticker && activePayload.latest_job.ticker.toUpperCase() === queryTicker.toUpperCase())) {
              setJob(activePayload.latest_job);
            }
          }
        }
      })
      .catch(() => {});

    const historyId = new URLSearchParams(window.location.search).get("history");
    if (historyId) {
      setLoadingHistoryId(historyId);
      api(`/api/history/${encodeURIComponent(historyId)}`)
        .then((restored) => {
          setHistoryJob(restored);
          setPage("history-detail");
        })
        .catch((error) => {
          setHistoryError(error.message);
          setPage("history");
        })
        .finally(() => setLoadingHistoryId(null));
    }

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("page") || "analysis";
      setPage(p);
      localStorage.setItem("tradingagents_page", p);
      const t = params.get("ticker");
      if (t) {
        setForm((prev) => ({ ...prev, ticker: t.toUpperCase() }));
        setJob((currentJob) => {
          if (currentJob && currentJob.ticker && currentJob.ticker.toUpperCase() !== t.toUpperCase()) {
            return null;
          }
          return currentJob;
        });
      }
      const tickers = params.get("tickers");
      if (tickers) setCompareTickers(tickers.split(",").map((s) => s.trim().toUpperCase()));

      const hId = params.get("history");
      if (p === "history-detail" && hId) {
        setLoadingHistoryId(hId);
        api(`/api/history/${encodeURIComponent(hId)}`)
          .then((restored) => setHistoryJob(restored))
          .catch((error) => {
            setHistoryError(error.message);
            setPage("history");
          })
          .finally(() => setLoadingHistoryId(null));
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [loadStatus, loadHistory, loadCapabilities, setJob, setScanJob]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTicker = params.get("ticker");
    if (queryTicker) {
      setForm((prev) => ({ ...prev, ticker: queryTicker.toUpperCase() }));
      setJob((currentJob) => {
        if (currentJob && currentJob.ticker && currentJob.ticker.toUpperCase() !== queryTicker.toUpperCase()) {
          return null;
        }
        return currentJob;
      });
    }
  }, [page, setJob]);

  useEffect(() => {
    if (page !== "settings" || !analysisActive) return undefined;
    const timer = window.setInterval(loadStatus, 2500);
    return () => window.clearInterval(timer);
  }, [page, analysisActive, loadStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [page, job?.id]);

  useEffect(() => {
    const titles = {
      analysis: job?.result?.ticker ? `TradingAgents · ${job.result.ticker} (${job.result.display_decision || "Analyse"})` : "TradingAgents · Nouvelle analyse",
      scanner: "TradingAgents · Scanner de marché",
      compare: "TradingAgents · Comparateur d'actifs",
      watchlist: "TradingAgents · Titres surveillés",
      performance: "TradingAgents · Simulateur de performance",
      history: "TradingAgents · Historique & Audit",
      settings: "TradingAgents · Paramètres & IA",
      landing: "TradingAgents · Plateforme d'arbitrage IA",
    };
    document.title = titles[page] || "TradingAgents";
  }, [page, job?.result?.ticker, job?.result?.display_decision]);

  useEffect(() => {
    if (["history", "compare", "performance", "watchlist"].includes(page)) {
      loadHistory();
    }
  }, [page, loadHistory]);

  useEffect(() => {
    if (page !== "history" || !scanActive) return undefined;
    const timer = window.setInterval(loadHistory, 3000);
    return () => window.clearInterval(timer);
  }, [page, scanActive, loadHistory]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await submitAnalysis(form);
    } catch {
      // error set in hook
    }
  };

  const navigate = (nextPage, extraParams = {}) => {
    const applyNavigation = () => {
      setPage(nextPage);
      localStorage.setItem("tradingagents_page", nextPage);
      const url = new URL(window.location);
      url.searchParams.set("page", nextPage);
      Object.keys(extraParams).forEach((k) => {
        if (extraParams[k]) url.searchParams.set(k, extraParams[k]);
        else url.searchParams.delete(k);
      });
      if (nextPage !== "history-detail") {
        url.searchParams.delete("history");
      }
      window.history.pushState({}, "", url.toString());
    };

    if (document.startViewTransition) {
      document.startViewTransition(applyNavigation);
    } else {
      applyNavigation();
    }
  };

  const reset = () => {
    resetJob();
    navigate("analysis");
  };

  const openHistory = async (item) => {
    const id = typeof item === "string" ? item : item?.id;
    if (!id) {
      if (item?.ticker) {
        setForm((f) => ({ ...f, ticker: item.ticker }));
        navigate("analysis", { ticker: item.ticker });
      }
      return;
    }
    setLoadingHistoryId(id);
    setHistoryError("");
    try {
      const restored = await api(`/api/history/${encodeURIComponent(id)}`);
      setHistoryJob(restored);
      navigate("history-detail", { history: id });
    } catch (error) {
      setHistoryError(error.message);
      showToast(`Impossible d'ouvrir le rapport : ${error.message}`);
    } finally {
      setLoadingHistoryId(null);
    }
  };

  const handleDeleteHistoryItem = async (historyId) => {
    try {
      await api(`/api/history/${historyId}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((item) => item.id !== historyId));
      showToast("Analyse supprimée de l’historique.");
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  const handleAddToWatchlist = (ticker) => {
    addWatchlist(ticker);
    showToast(`${ticker} ajouté à votre Watchlist !`);
  };

  const handleCompareTickers = (tickers) => {
    setCompareTickers(tickers);
    navigate("compare", { tickers: tickers.join(",") });
  };

  const handleCompareSingleTicker = (ticker) => {
    setCompareTickers((prev) => Array.from(new Set([ticker, ...prev])).slice(0, 3));
    navigate("compare");
  };

  const handleAnalyzeFromWatchlist = (ticker) => {
    setForm((f) => ({ ...f, ticker }));
    setJob(null);
    navigate("analysis", { ticker });
  };

  const showUnitBanner = analysisActive && page !== "analysis";
  const showScanBanner = scanActive && page !== "scanner";

  const SuspenseFallback = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "12px", color: "var(--muted)" }}>
      <LoaderCircle className="spin" size={32} />
      <span>Chargement de la vue...</span>
    </div>
  );

  return (
    <div className="app-shell">
      <PipelineGuidePopover />
      <Topbar onMenu={() => setMenuOpen(true)} online={status.online} model={activeModel} />
      <Sidebar
        page={page}
        onPage={navigate}
        online={status.online}
        model={activeModel}
        provider={status.provider_name || "LLM"}
        analysisActive={analysisActive}
        scanActive={scanActive}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {menuOpen ? <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" /> : null}

      <div className="content-shell">
        <AnimatePresence>
          {showUnitBanner || showScanBanner ? (
            <div className="global-live-banner-wrap">
              {showUnitBanner ? (
                <motion.div
                  key="unit-live-banner"
                  className="global-live-banner unit"
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                >
                  <div className="banner-left">
                    <span className="pulse-dot unit" />
                    <div className="banner-info">
                      <strong>Analyse de {job.ticker} en cours</strong>
                      <small>
                        {job.stage_label || "Calcul multi-agents"} · {job.total_tokens ? `${formatTokens(job.total_tokens)} tokens` : "Initialisation"}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="banner-action-btn"
                    onClick={() => navigate("analysis", { ticker: job.ticker })}
                    title="Ouvrir le direct de l'analyse"
                  >
                    <Play size={13} /> Reprendre le direct
                  </button>
                </motion.div>
              ) : null}

              {showScanBanner ? (
                <motion.div
                  key="scan-live-banner"
                  className="global-live-banner scan"
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                >
                  <div className="banner-left">
                    <span className="pulse-dot scan" />
                    <div className="banner-info">
                      <strong>Scan de marché en cours</strong>
                      <small>
                        {scanJob.analysis_progress?.completed || 0}/{scanJob.analysis_progress?.total || 0} analyses terminées · Ticker actif : {scanJob.active_symbol || "Préfiltrage"}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="banner-action-btn scan"
                    onClick={() => navigate("scanner")}
                    title="Ouvrir le direct du scanner"
                  >
                    <ScanSearch size={13} /> Suivre le scan
                  </button>
                </motion.div>
              ) : null}
            </div>
          ) : null}
        </AnimatePresence>

        <Suspense fallback={SuspenseFallback}>
          <AnimatePresence mode="wait">
            {page === "landing" ? (
              <motion.div key="landing" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <LandingPage
                  onLaunchApp={() => navigate("analysis")}
                  onOpenAnalysis={(ticker) => {
                    setForm((f) => ({ ...f, ticker }));
                    navigate("analysis", { ticker });
                  }}
                />
              </motion.div>
            ) : null}
            {page === "analysis" ? (
              <motion.div key="analysis" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <AnalysisPage
                  form={form}
                  setForm={setForm}
                  job={job}
                  online={status.online}
                  analysts={capabilities.analysts}
                  dataSteps={capabilities.data_steps}
                  analystsError={capabilitiesError}
                  pollWarning={pollWarning}
                  onSubmit={submit}
                  onReset={reset}
                  onAddToWatchlist={handleAddToWatchlist}
                  onCompareTicker={handleCompareSingleTicker}
                  onShowToast={showToast}
                />
              </motion.div>
            ) : null}
            {page === "performance" ? (
              <motion.div key="performance" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <PerformancePage
                  onSelectAnalysis={(historyId) => {
                    const item = history.find((h) => h.id === historyId);
                    if (item) openHistory(item);
                    else {
                      api(`/api/history/${historyId}`).then((restored) => {
                        setHistoryJob(restored);
                        navigate("history-detail", { history: historyId });
                      });
                    }
                  }}
                />
              </motion.div>
            ) : null}
            {page === "scanner" ? (
              <motion.div key="scanner" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <ScannerPage
                  online={status.online}
                  job={scanJob}
                  setJob={setScanJob}
                  onOpenAnalysis={openHistory}
                  onAddToWatchlist={handleAddToWatchlist}
                  onCompareTickers={handleCompareTickers}
                  history={history}
                />
              </motion.div>
            ) : null}
            {page === "compare" ? (
              <motion.div key="compare" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <ComparePage
                  history={history}
                  initialTickers={compareTickers}
                  onOpenAnalysis={(item) => {
                    if (item?.id) openHistory(item);
                    else if (item?.ticker) {
                      setForm((f) => ({ ...f, ticker: item.ticker }));
                      navigate("analysis", { ticker: item.ticker });
                    }
                  }}
                  onAnalyzeTicker={(ticker) => {
                    setForm((f) => ({ ...f, ticker }));
                    setJob(null);
                    navigate("analysis", { ticker });
                  }}
                />
              </motion.div>
            ) : null}
            {page === "watchlist" ? (
              <motion.div key="watchlist" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <WatchlistPage
                  history={history}
                  onOpenAnalysis={openHistory}
                  onAnalyzeTicker={handleAnalyzeFromWatchlist}
                  onCompareTicker={handleCompareSingleTicker}
                  onCompareTickers={handleCompareTickers}
                />
              </motion.div>
            ) : null}
            {page === "history" ? (
              <motion.div key="history" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <HistoryPage
                  history={history}
                  loadingId={loadingHistoryId}
                  error={historyError}
                  onSelect={openHistory}
                  onDeleteItem={handleDeleteHistoryItem}
                  onRefresh={loadHistory}
                  isScanning={scanActive}
                />
              </motion.div>
            ) : null}
            {page === "history-detail" ? (
              historyJob ? (
                <motion.div key={`history-detail-${historyJob.id}`} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                  <ResultPage
                    key={historyJob.id}
                    job={historyJob}
                    historical
                    onBackHistory={() => navigate("history")}
                    onAddToWatchlist={handleAddToWatchlist}
                    onCompareTicker={handleCompareSingleTicker}
                    onShowToast={showToast}
                  />
                </motion.div>
              ) : (
                <motion.div key="history-detail-loading" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                  <main className="page result-page">
                    <div className="table-loading" style={{ padding: "60px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <LoaderCircle className="spin" size={32} />
                      <span>Chargement du rapport d’analyse...</span>
                    </div>
                  </main>
                </motion.div>
              )
            ) : null}
            {page === "models" || page === "settings" ? (
              <motion.div key="settings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <SettingsPage status={status} refresh={loadStatus} theme={theme} onToggleTheme={toggleTheme} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Suspense>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="toast-notification"
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <CheckCircle2 size={18} />
            <span>{toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <GlobalDisclaimerPopup />
    </div>
  );
}
