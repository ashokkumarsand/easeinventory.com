'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  isBase?: boolean;
}

interface CurrencyContextType {
  currencies: Currency[];
  allowedCurrencies: Currency[];  // Currencies allowed for this tenant
  currentCurrency: Currency;
  baseCurrency: Currency;
  isLoading: boolean;
  error: string | null;
  setCurrency: (code: string) => void;
  refreshRates: () => Promise<void>;
  convert: (amount: number, fromCode?: string, toCode?: string) => number;
  format: (amount: number, currencyCode?: string) => string;
  formatWithCode: (amount: number, currencyCode?: string) => string;
  showCurrencySelector: boolean;  // Whether to show currency selector (false if only 1 currency)
}

const defaultBaseCurrency: Currency = {
  id: 'default',
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  exchangeRate: 1,
  decimalPlaces: 2,
  symbolPosition: 'before',
  isBase: true,
};

// Default currencies for fallback when API fails
const defaultCurrencies: Currency[] = [
  { id: 'usd', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1, decimalPlaces: 2, symbolPosition: 'before', isBase: true },
  { id: 'eur', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, decimalPlaces: 2, symbolPosition: 'before' },
  { id: 'gbp', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, decimalPlaces: 2, symbolPosition: 'before' },
  { id: 'inr', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.12, decimalPlaces: 2, symbolPosition: 'before' },
  { id: 'jpy', code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.50, decimalPlaces: 0, symbolPosition: 'before' },
  { id: 'cny', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.24, decimalPlaces: 2, symbolPosition: 'before' },
  { id: 'aed', code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.67, decimalPlaces: 2, symbolPosition: 'before' },
  { id: 'sar', code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 3.75, decimalPlaces: 2, symbolPosition: 'before' },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrencyCode?: string;
}

export function CurrencyProvider({ children, defaultCurrencyCode = 'USD' }: CurrencyProviderProps) {
  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [allowedCurrencyCodes, setAllowedCurrencyCodes] = useState<string[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrencies[0]);
  const [baseCurrency, setBaseCurrency] = useState<Currency>(defaultCurrencies[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch currencies from API (includes tenant's allowed currencies)
  const fetchCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/currencies');

      let fetchedCurrencies: Currency[];
      let tenantAllowedCodes: string[] = [];
      let tenantDefaultCurrency: string | null = null;

      if (!response.ok) {
        // Use fallback currencies if API fails (e.g., database not migrated)
        console.warn('Currency API unavailable, using defaults');
        fetchedCurrencies = defaultCurrencies;
      } else {
        const data = await response.json();
        fetchedCurrencies = data.currencies?.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          exchangeRate: Number(c.exchangeRate),
          decimalPlaces: c.decimalPlaces,
          symbolPosition: c.symbolPosition as 'before' | 'after',
          isBase: c.isBase,
        })) || defaultCurrencies;

        // Get tenant's allowed currencies from the response
        tenantAllowedCodes = data.allowedCurrencies || [];
        tenantDefaultCurrency = data.tenantCurrency || null;
      }

      if (fetchedCurrencies.length > 0) {
        setCurrencies(fetchedCurrencies);
        setAllowedCurrencyCodes(tenantAllowedCodes);

        // Set base currency
        const base = fetchedCurrencies.find(c => c.isBase) || fetchedCurrencies[0];
        setBaseCurrency(base);

        // Determine current currency priority:
        // 1. Saved preference (if allowed)
        // 2. Tenant's default currency
        // 3. First allowed currency
        // 4. Base currency
        const savedCode = typeof window !== 'undefined'
          ? localStorage.getItem('preferred_currency')
          : null;

        let targetCode = defaultCurrencyCode;
        if (savedCode && (tenantAllowedCodes.length === 0 || tenantAllowedCodes.includes(savedCode))) {
          targetCode = savedCode;
        } else if (tenantDefaultCurrency) {
          targetCode = tenantDefaultCurrency;
        } else if (tenantAllowedCodes.length > 0) {
          targetCode = tenantAllowedCodes[0];
        }

        const current = fetchedCurrencies.find(c => c.code === targetCode) || base;
        setCurrentCurrency(current);
      }
    } catch (err) {
      console.error('Error fetching currencies, using defaults:', err);
      // Fallback to defaults on any error
      setCurrencies(defaultCurrencies);
      setBaseCurrency(defaultCurrencies[0]);
      setCurrentCurrency(defaultCurrencies.find(c => c.code === defaultCurrencyCode) || defaultCurrencies[0]);
    } finally {
      setIsLoading(false);
    }
  }, [defaultCurrencyCode]);

  // Initial fetch
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  // Set current currency
  const setCurrency = useCallback((code: string) => {
    const currency = currencies.find(c => c.code === code);
    if (currency) {
      setCurrentCurrency(currency);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_currency', code);
      }
    }
  }, [currencies]);

  // Refresh exchange rates from external API
  const refreshRates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/currencies/rates', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to refresh rates');
      }
      await fetchCurrencies();
    } catch (err) {
      console.error('Error refreshing rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh rates');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrencies]);

  // Convert amount between currencies
  const convert = useCallback((
    amount: number,
    fromCode: string = baseCurrency.code,
    toCode: string = currentCurrency.code
  ): number => {
    if (fromCode === toCode) return amount;

    const fromCurrency = currencies.find(c => c.code === fromCode);
    const toCurrency = currencies.find(c => c.code === toCode);

    if (!fromCurrency || !toCurrency) return amount;

    // Convert to base currency first, then to target
    const inBase = amount / fromCurrency.exchangeRate;
    const converted = inBase * toCurrency.exchangeRate;

    return Number(converted.toFixed(toCurrency.decimalPlaces));
  }, [currencies, baseCurrency, currentCurrency]);

  // Format amount with currency symbol
  const format = useCallback((
    amount: number,
    currencyCode?: string
  ): string => {
    const currency = currencyCode
      ? currencies.find(c => c.code === currencyCode) || currentCurrency
      : currentCurrency;

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);

    if (currency.symbolPosition === 'after') {
      return `${formatted} ${currency.symbol}`;
    }
    return `${currency.symbol}${formatted}`;
  }, [currencies, currentCurrency]);

  // Format with currency code (e.g., "100.00 USD")
  const formatWithCode = useCallback((
    amount: number,
    currencyCode?: string
  ): string => {
    const currency = currencyCode
      ? currencies.find(c => c.code === currencyCode) || currentCurrency
      : currentCurrency;

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(amount);

    return `${formatted} ${currency.code}`;
  }, [currencies, currentCurrency]);

  // Filter currencies by tenant's allowed list
  const allowedCurrencies = allowedCurrencyCodes.length > 0
    ? currencies.filter(c => allowedCurrencyCodes.includes(c.code))
    : currencies;

  // Only show selector if tenant has more than one currency allowed
  const showCurrencySelector = allowedCurrencies.length > 1;

  const value: CurrencyContextType = {
    currencies,
    allowedCurrencies,
    currentCurrency,
    baseCurrency,
    isLoading,
    error,
    setCurrency,
    refreshRates,
    convert,
    format,
    formatWithCode,
    showCurrencySelector,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export { CurrencyContext };
