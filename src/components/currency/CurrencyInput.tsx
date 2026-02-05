'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number, currencyCode: string) => void;
  currencyCode?: string;
  onCurrencyChange?: (code: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  allowCurrencyChange?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      currencyCode,
      onCurrencyChange,
      placeholder = '0.00',
      label,
      error,
      disabled = false,
      allowCurrencyChange = true,
      className = '',
      size = 'md',
    },
    ref
  ) => {
    const { currencies, currentCurrency } = useCurrency();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCurrency = currencyCode
      ? currencies.find(c => c.code === currencyCode) || currentCurrency
      : currentCurrency;

    // Sync input value with prop
    useEffect(() => {
      setInputValue(value === 0 ? '' : value.toString());
    }, [value]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow empty, numbers, and one decimal point
      if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
        setInputValue(raw);
        const numValue = parseFloat(raw) || 0;
        onChange(numValue, selectedCurrency.code);
      }
    };

    const handleBlur = () => {
      // Format on blur
      const numValue = parseFloat(inputValue) || 0;
      const formatted = numValue.toFixed(selectedCurrency.decimalPlaces);
      setInputValue(numValue === 0 ? '' : formatted);
    };

    const handleCurrencySelect = (currency: Currency) => {
      onCurrencyChange?.(currency.code);
      onChange(value, currency.code);
      setIsDropdownOpen(false);
    };

    // Size classes
    const sizeClasses = {
      sm: 'h-9 text-sm',
      md: 'h-11 text-base',
      lg: 'h-14 text-lg',
    };

    const symbolSizeClasses = {
      sm: 'text-sm px-2',
      md: 'text-base px-3',
      lg: 'text-lg px-4',
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative flex" ref={dropdownRef}>
          {/* Currency selector */}
          <button
            type="button"
            onClick={() => allowCurrencyChange && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled || !allowCurrencyChange}
            className={`
              flex items-center gap-1 bg-foreground/5 border border-r-0 border-divider rounded-l-xl
              ${symbolSizeClasses[size]}
              ${allowCurrencyChange ? 'hover:bg-foreground/10 cursor-pointer' : 'cursor-default'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              transition-colors
            `}
          >
            <span className="font-medium">{selectedCurrency.symbol}</span>
            {allowCurrencyChange && (
              <ChevronDown className={`w-3 h-3 text-foreground/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Amount input */}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 min-w-0 bg-content1 border border-divider rounded-r-xl px-3
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
              placeholder:text-foreground/30
              ${sizeClasses[size]}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-foreground/5' : ''}
              ${error ? 'border-danger focus:ring-danger/20 focus:border-danger/50' : ''}
              transition-colors
            `}
          />

          {/* Currency dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-56 bg-content1 border border-divider rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="max-h-64 overflow-y-auto py-1">
                  {currencies.map(currency => (
                    <button
                      key={currency.id}
                      type="button"
                      onClick={() => handleCurrencySelect(currency)}
                      className={`w-full px-3 py-2.5 text-left flex items-center gap-3 hover:bg-foreground/5 transition-colors ${
                        currency.code === selectedCurrency.code ? 'bg-primary/10' : ''
                      }`}
                    >
                      <span className="w-8 text-center text-lg">{currency.symbol}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{currency.code}</div>
                        <div className="text-xs text-foreground/50 truncate">{currency.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
