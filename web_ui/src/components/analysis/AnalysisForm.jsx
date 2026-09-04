import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  LoaderCircle,
  MessageSquareText,
  Newspaper,
  Play,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import StockSearchInput from "../../StockSearchInput.jsx";
import AnalystToggle from "./AnalystToggle.jsx";

export const ANALYST_ICONS = {
  market: BarChart3,
  news: Newspaper,
  social: MessageSquareText,
  fundamentals: BookOpen,
};

export const PRESETS = [
  { ticker: "NVDA", label: "NVDA · NVIDIA" },
  { ticker: "MC.PA", label: "MC · LVMH" },
  { ticker: "MSFT", label: "MSFT · Microsoft" },
  { ticker: "AIR.PA", label: "AIR · Airbus" },
  { ticker: "AAPL", label: "AAPL · Apple" },
  { ticker: "TSLA", label: "TSLA · Tesla" },
];

export default function AnalysisForm({ form, setForm, disabled, online, analysts, analystsError, onSubmit }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleAnalyst = (id) => {
    setForm((current) => {
      const exists = current.analysts.includes(id);
      if (exists && current.analysts.length === 1) return current;
      return {
        ...current,
        analysts: exists
          ? current.analysts.filter((item) => item !== id)
          : [...current.analysts, id],
      };
    });
  };

  const depthLabels = { 1: "Rapide", 2: "Moyenne", 3: "Approfondie" };

  return (
    <div className="analysis-launcher-card">
      <form className="analysis-launcher-form" onSubmit={onSubmit}>
        <StockSearchInput
          value={form.ticker}
          onChange={(ticker) => setForm((prev) => ({ ...prev, ticker }))}
          onSelect={(stock) => setForm((prev) => ({ ...prev, ticker: stock.ticker }))}
          placeholder="Entrez un symbole ou nom d'action (ex: NVDA, LVMH, MSFT, Total)..."
          disabled={disabled}
          pattern="[A-Za-z0-9.\-^=]{1,20}"
          required
          inputIcon={<Search size={19} className="launcher-search-icon" />}
          className="launcher-search-wrapper"
          inputClassName="launcher-input"
        >
          <motion.button
            className="primary-button launcher-submit-btn"
            type="submit"
            disabled={disabled || !online || analysts.length === 0 || form.analysts.length === 0 || !form.ticker.trim()}
            whileHover={disabled || !online ? {} : { scale: 1.02 }}
            whileTap={disabled || !online ? {} : { scale: 0.98 }}
          >
            {disabled ? <LoaderCircle className="spin" size={17} /> : <Play size={17} fill="currentColor" />}
            {disabled ? "Analyse en cours…" : "Lancer l'analyse"}
          </motion.button>
        </StockSearchInput>

        <div className="launcher-footer">
          <div className="quick-preset-chips" aria-label="Suggestions rapides de titres">
            <span>Populaires :</span>
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.ticker}
                type="button"
                className="chip-button"
                disabled={disabled}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setForm((prev) => ({ ...prev, ticker: preset.ticker }))}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>

          <button
            type="button"
            className="advanced-toggle-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal size={14} />
            <span>Options d'analyse ({depthLabels[form.depth]} · {form.analysts.length} analystes)</span>
            <ChevronDown
              size={14}
              style={{
                transform: showAdvanced ? "rotate(180deg)" : "none",
                transition: "transform 180ms ease",
              }}
            />
          </button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              className="advanced-options-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="advanced-options-grid">
                <label className="field date-field">
                  <span>Date de marché</span>
                  <input
                    type="date"
                    value={form.date}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    required
                    disabled={disabled}
                  />
                </label>
                <label className="field depth-field">
                  <span>Profondeur de recherche</span>
                  <select
                    value={form.depth}
                    onChange={(event) => setForm({ ...form, depth: Number(event.target.value) })}
                    disabled={disabled}
                  >
                    <option value="1">Rapide (1 tour)</option>
                    <option value="2">Moyenne (2 tours)</option>
                    <option value="3">Approfondie (3 tours)</option>
                  </select>
                </label>
              </div>

              <fieldset className="analyst-field" disabled={disabled || analysts.length === 0}>
                <legend>Analystes IA déployés</legend>
                <div className="analyst-options">
                  {analysts.length ? analysts.map((analyst) => {
                    const Icon = ANALYST_ICONS[analyst.id] || Users;
                    return (
                      <AnalystToggle
                        key={analyst.id}
                        id={analyst.id}
                        label={analyst.name}
                        description={analyst.description}
                        Icon={Icon}
                        selected={form.analysts.includes(analyst.id)}
                        disabled={disabled}
                        onToggle={toggleAnalyst}
                      />
                    );
                  }) : <span className="analyst-options-status">{analystsError || "Chargement des analystes…"}</span>}
                </div>
              </fieldset>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
