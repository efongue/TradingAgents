import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { useWatchlist } from "../../hooks/useWatchlist.js";

export default function WatchlistToggleButton({ ticker, onShowToast }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(ticker);

  const handleToggle = () => {
    const { added } = toggleWatchlist(ticker);
    if (onShowToast) {
      onShowToast(added ? `${ticker} ajouté à votre Watchlist !` : `${ticker} retiré de votre Watchlist`);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`secondary-button watchlist-toggle-btn ${bookmarked ? "bookmarked" : ""}`}
      onClick={handleToggle}
      title={bookmarked ? "Dans votre Watchlist (cliquer pour retirer)" : "Ajouter ce titre à la Watchlist"}
    >
      <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
      <span>{bookmarked ? "Dans la Watchlist" : "Watchlist"}</span>
    </motion.button>
  );
}
