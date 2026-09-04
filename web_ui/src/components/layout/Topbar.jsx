import React from "react";
import { HelpCircle, Menu } from "lucide-react";

export default function Topbar({ onMenu, online, model }) {
  return (
    <header className="mobile-topbar">
      <button className="icon-button" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={22} />
      </button>
      <span className="brand">TradingAgents</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          popovertarget="pipeline-guide-popover"
          className="guide-button-pill"
          title="Guide & Méthodologie"
        >
          <HelpCircle size={15} /> Guide
        </button>
        <span className={`status-dot ${online ? "online" : "offline"}`} title={model} />
      </div>
    </header>
  );
}
