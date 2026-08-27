import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchStocks } from "./companyNames.js";

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
  maxSuggestions = 7,
  required = false,
  pattern,
  id,
  ariaLabel = "Symbole boursier ou nom d'action",
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const suggestions = useMemo(() => {
    if (!value || !value.trim()) return [];
    return searchStocks(value, maxSuggestions);
  }, [value, maxSuggestions]);

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
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        selectStock(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Tab") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectStock(suggestions[highlightedIndex]);
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
        />
        {children}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 ? (
          <motion.div
            ref={dropdownRef}
            className="launcher-autocomplete-dropdown"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <div className="autocomplete-header">
              <span>Actions suggérées ({suggestions.length})</span>
              <small>↑↓ naviguer · ↵ valider · Echap fermer</small>
            </div>
            <ul className="autocomplete-list" role="listbox">
              {suggestions.map((stock, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={stock.ticker}
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
