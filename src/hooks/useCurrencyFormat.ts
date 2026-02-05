'use client';

import { useMemo, useCallback } from 'react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';

interface FormatOptions {
  showCode?: boolean;
  showSymbol?: boolean;
  compact?: boolean;
  convertFrom?: string;
}

interface CurrencyFormatHook {
  // Core formatting
  formatPrice: (amount: number, options?: FormatOptions) => string;
  formatRange: (min: number, max: number, options?: FormatOptions) => string;

  // Conversion helpers
  toBaseCurrency: (amount: number, fromCode?: string) => number;
  fromBaseCurrency: (amount: number, toCode?: string) => number;
  convertBetween: (amount: number, fromCode: string, toCode: string) => number;

  // Display helpers
  getSymbol: (currencyCode?: string) => string;
  getCurrencyByCode: (code: string) => Currency | undefined;

  // Multi-currency display
  formatMultiCurrency: (amounts: { code: string; amount: number }[]) => string;

  // Current state
  currentCode: string;
  currentSymbol: string;
  isBaseCurrency: boolean;
}

export function useCurrencyFormat(): CurrencyFormatHook {
  const {
    currencies,
    currentCurrency,
    baseCurrency,
    convert,
    format,
    formatWithCode,
  } = useCurrency();

  // Format a price with options
  const formatPrice = useCallback((
    amount: number,
    options: FormatOptions = {}
  ): string => {
    const { showCode, showSymbol = true, compact, convertFrom } = options;

    // Convert if needed
    let displayAmount = amount;
    if (convertFrom && convertFrom !== currentCurrency.code) {
      displayAmount = convert(amount, convertFrom, currentCurrency.code);
    }

    // Compact formatting for large numbers
    if (compact && Math.abs(displayAmount) >= 1000) {
      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      });
      const compactValue = formatter.format(displayAmount);

      if (showCode) {
        return `${compactValue} ${currentCurrency.code}`;
      }
      if (showSymbol) {
        return currentCurrency.symbolPosition === 'after'
          ? `${compactValue} ${currentCurrency.symbol}`
          : `${currentCurrency.symbol}${compactValue}`;
      }
      return compactValue;
    }

    // Standard formatting
    if (showCode) {
      return formatWithCode(displayAmount);
    }
    if (showSymbol) {
      return format(displayAmount);
    }

    // Plain number
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currentCurrency.decimalPlaces,
      maximumFractionDigits: currentCurrency.decimalPlaces,
    }).format(displayAmount);
  }, [currentCurrency, convert, format, formatWithCode]);

  // Format a price range
  const formatRange = useCallback((
    min: number,
    max: number,
    options: FormatOptions = {}
  ): string => {
    if (min === max) {
      return formatPrice(min, options);
    }

    const minFormatted = formatPrice(min, { ...options, showSymbol: false, showCode: false });
    const maxFormatted = formatPrice(max, options);

    if (options.showCode) {
      return `${minFormatted} - ${maxFormatted}`;
    }

    const symbol = currentCurrency.symbol;
    if (currentCurrency.symbolPosition === 'after') {
      return `${minFormatted} - ${maxFormatted}`;
    }
    return `${symbol}${minFormatted} - ${symbol}${maxFormatted}`;
  }, [formatPrice, currentCurrency]);

  // Convert to base currency
  const toBaseCurrency = useCallback((
    amount: number,
    fromCode?: string
  ): number => {
    const from = fromCode || currentCurrency.code;
    return convert(amount, from, baseCurrency.code);
  }, [convert, currentCurrency, baseCurrency]);

  // Convert from base currency
  const fromBaseCurrency = useCallback((
    amount: number,
    toCode?: string
  ): number => {
    const to = toCode || currentCurrency.code;
    return convert(amount, baseCurrency.code, to);
  }, [convert, currentCurrency, baseCurrency]);

  // Convert between any two currencies
  const convertBetween = useCallback((
    amount: number,
    fromCode: string,
    toCode: string
  ): number => {
    return convert(amount, fromCode, toCode);
  }, [convert]);

  // Get currency symbol
  const getSymbol = useCallback((currencyCode?: string): string => {
    if (!currencyCode) return currentCurrency.symbol;
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  }, [currencies, currentCurrency]);

  // Get currency by code
  const getCurrencyByCode = useCallback((code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  }, [currencies]);

  // Format multiple currency amounts
  const formatMultiCurrency = useCallback((
    amounts: { code: string; amount: number }[]
  ): string => {
    return amounts
      .map(({ code, amount }) => {
        const currency = currencies.find(c => c.code === code);
        if (!currency) return `${amount} ${code}`;

        const formatted = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: currency.decimalPlaces,
          maximumFractionDigits: currency.decimalPlaces,
        }).format(amount);

        return currency.symbolPosition === 'after'
          ? `${formatted} ${currency.symbol}`
          : `${currency.symbol}${formatted}`;
      })
      .join(' / ');
  }, [currencies]);

  // Memoized current state
  const currentCode = useMemo(() => currentCurrency.code, [currentCurrency]);
  const currentSymbol = useMemo(() => currentCurrency.symbol, [currentCurrency]);
  const isBaseCurrency = useMemo(
    () => currentCurrency.code === baseCurrency.code,
    [currentCurrency, baseCurrency]
  );

  return {
    formatPrice,
    formatRange,
    toBaseCurrency,
    fromBaseCurrency,
    convertBetween,
    getSymbol,
    getCurrencyByCode,
    formatMultiCurrency,
    currentCode,
    currentSymbol,
    isBaseCurrency,
  };
}
