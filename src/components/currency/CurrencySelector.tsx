'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, RefreshCw, Globe2 } from 'lucide-react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';

interface CurrencySelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  showRefresh?: boolean;
  className?: string;
}

export function CurrencySelector({
  variant = 'default',
  showRefresh = false,
  className = '',
}: CurrencySelectorProps) {
  const { currencies, currentCurrency, setCurrency, refreshRates, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(
    c =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (currency: Currency) => {
    setCurrency(currency.code);
    setIsOpen(false);
    setSearch('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setIsRefreshing(false);
  };

  // Minimal variant - just the code
  if (variant === 'minimal') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
        >
          {currentCurrency.code}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1 w-40 bg-content1 border border-divider rounded-lg shadow-lg overflow-hidden z-50"
            >
              {currencies.map(currency => (
                <button
                  key={currency.id}
                  onClick={() => handleSelect(currency)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-foreground/5 transition-colors ${
                    currency.code === currentCurrency.code ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span>{currency.code}</span>
                  {currency.code === currentCurrency.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors"
        >
          <span className="text-lg">{currentCurrency.symbol}</span>
          <span>{currentCurrency.code}</span>
          <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-56 bg-content1 border border-divider rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 border-b border-divider">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currencies..."
                  className="w-full px-3 py-2 text-sm bg-foreground/5 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredCurrencies.map(currency => (
                  <button
                    key={currency.id}
                    onClick={() => handleSelect(currency)}
                    className={`w-full px-3 py-2.5 text-left flex items-center gap-3 hover:bg-foreground/5 transition-colors ${
                      currency.code === currentCurrency.code ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="w-8 text-center text-lg">{currency.symbol}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{currency.code}</div>
                      <div className="text-xs text-foreground/50 truncate">{currency.name}</div>
                    </div>
                    {currency.code === currentCurrency.code && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant - full selector with rates
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-3 px-4 py-2.5 bg-content1 border border-divider hover:border-foreground/20 rounded-xl transition-all"
      >
        <Globe2 className="w-5 h-5 text-foreground/50" />
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{currentCurrency.symbol}</span>
            <span className="font-semibold">{currentCurrency.code}</span>
          </div>
          <div className="text-xs text-foreground/50">{currentCurrency.name}</div>
        </div>
        <ChevronDown className={`w-5 h-5 text-foreground/40 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 mt-2 w-80 bg-content1 border border-divider rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header with search */}
            <div className="p-3 border-b border-divider bg-foreground/[0.02]">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currencies..."
                className="w-full px-4 py-2.5 text-sm bg-foreground/5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-foreground/30"
              />
            </div>

            {/* Currency list */}
            <div className="max-h-80 overflow-y-auto">
              {filteredCurrencies.length === 0 ? (
                <div className="p-8 text-center text-foreground/50 text-sm">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map(currency => (
                  <button
                    key={currency.id}
                    onClick={() => handleSelect(currency)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-4 hover:bg-foreground/5 transition-colors ${
                      currency.code === currentCurrency.code ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-lg font-medium">
                      {currency.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{currency.code}</span>
                        {currency.isBase && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            BASE
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-foreground/50 truncate">{currency.name}</div>
                    </div>
                    <div className="text-right">
                      {!currency.isBase && (
                        <div className="text-sm font-medium text-foreground/70">
                          {currency.exchangeRate.toFixed(currency.exchangeRate >= 100 ? 0 : 2)}
                        </div>
                      )}
                      {currency.code === currentCurrency.code && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer with refresh */}
            {showRefresh && (
              <div className="p-3 border-t border-divider bg-foreground/[0.02]">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Updating rates...' : 'Refresh exchange rates'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
