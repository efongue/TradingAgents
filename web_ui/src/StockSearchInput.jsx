import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Globe } from "lucide-react";
import { searchStocks } from "./companyNames.js";
import { api } from "./api.js";

export default function StockSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = "Entrez un symbole ou nom d'action...",
  disabled = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
  inputIcon = null,
  children = null,
  maxSuggestions = 6,
  required = false,
  pattern,
  id,
  ariaLabel = "Symbole boursier ou nom d'action",
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [liveResults, setLiveResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const cleanTicker = (value || "").trim().toUpperCase();

  const localSuggestions = useMemo(() => {
    if (!cleanTicker) return [];
    return searchStocks(cleanTicker, maxSuggestions);
  }, [cleanTicker, maxSuggestions]);

  // Live remote search debounced
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!cleanTicker || cleanTicker.length < 2) {
      setLiveResults([]);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      api(`/api/search-live?q=${encodeURIComponent(cleanTicker)}&limit=${maxSuggestions}`)
        .then((res) => {
          if (Array.isArray(res?.results)) {
            setLiveResults(res.results);
          }
        })
        .catch(() => {
          // Keep local fallback silently
        });
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cleanTicker, maxSuggestions]);

  // Combine matching suggestions with live results and the raw symbol option
  const items = useMemo(() => {
    if (!cleanTicker) return [];
    const list = [...localSuggestions];
    const seen = new Set(list.map((s) => s.ticker.toUpperCase()));

    for (const liveItem of liveResults) {
      const up = liveItem.ticker.toUpperCase();
      if (!seen.has(up)) {
        seen.add(up);
        list.push(liveItem);
      }
      if (list.length >= maxSuggestions + 3) break;
    }

    const exactMatch = list.some((s) => s.ticker.toUpperCase() === cleanTicker);
    if (!exactMatch) {
      list.push({
        ticker: cleanTicker,
        name: `Valider le symbole brut "${cleanTicker}"`,
        exchange: "Yahoo Finance",
        flag: "🌐",
        isRaw: true,
      });
    }
    return list;
  }, [cleanTicker, localSuggestions, liveResults, maxSuggestions]);

  const selectStock = (stock) => {
    if (onSelect) {
      onSelect(stock);
    } else if (onChange) {
      onChange(stock.ticker);
    }
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        e.preventDefault();
        selectStock(items[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Tab") {
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        selectStock(items[highlightedIndex]);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`stock-search-wrapper ${className}`}>
      <div className="stock-search-input-group">
        {inputIcon}
        <input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            onChange(val);
            setShowSuggestions(Boolean(val.trim()));
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (value && value.trim()) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          pattern={pattern}
          aria-label={ariaLabel}
          autoComplete="off"
          className={inputClassName}
          role="combobox"
          aria-expanded={showSuggestions && items.length > 0}
          aria-autocomplete="list"
          aria-controls="stock-search-suggestions-list"
        />
        {children}
      </div>

      <AnimatePresence>
        {showSuggestions && items.length > 0 ? (
          <motion.div
            ref={dropdownRef}
            className="launcher-autocomplete-dropdown"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <div className="autocomplete-header">
              <span>Actions suggérées ({items.length})</span>
              <small>↑↓ naviguer · ↵ valider · Echap fermer</small>
            </div>
            <ul id="stock-search-suggestions-list" className="autocomplete-list" role="listbox" aria-label="Suggestions d'actions">
              {items.map((stock, index) => {
                const isHighlighted = index === highlightedIndex;
                if (stock.isRaw) {
                  return (
                    <li
                      key={`raw-${stock.ticker}`}
                      role="option"
                      aria-selected={isHighlighted}
                      className={`autocomplete-item raw-symbol-item ${isHighlighted ? "highlighted" : ""}`}
                      onClick={() => selectStock(stock)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="autocomplete-ticker-col">
                        <strong className="autocomplete-ticker-tag raw">
                          <Zap size={11} /> {stock.ticker}
                        </strong>
                        <span className="autocomplete-name">
                          Symbole mondial {stock.ticker}
                        </span>
                      </div>
                      <div className="autocomplete-meta-col">
                        <span className="autocomplete-market-tag raw">
                          <Globe size={11} style={{ marginRight: 3, verticalAlign: "middle" }} />
                          Yahoo Finance
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={`${stock.ticker}-${index}`}
                    role="option"
                    aria-selected={isHighlighted}
                    className={`autocomplete-item ${isHighlighted ? "highlighted" : ""}`}
                    onClick={() => selectStock(stock)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="autocomplete-ticker-col">
                      <strong className="autocomplete-ticker-tag">{stock.ticker}</strong>
                      <span className="autocomplete-name">{stock.name}</span>
                    </div>
                    <div className="autocomplete-meta-col">
                      {stock.exchange ? (
                        <span className="autocomplete-market-tag">
                          {stock.flag ? `${stock.flag} ` : ""}{stock.exchange}
                        </span>
                      ) : null}
                      {stock.sector ? (
                        <span className="autocomplete-sector-tag">{stock.sector}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
