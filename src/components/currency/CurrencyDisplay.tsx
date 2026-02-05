'use client';

import { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CurrencyDisplayProps {
  /** Amount in the source currency */
  amount: number;
  /** Source currency code (defaults to base currency) */
  currencyCode?: string;
  /** Show amount converted to user's selected currency */
  convert?: boolean;
  /** Show currency code instead of symbol */
  showCode?: boolean;
  /** Compact notation for large numbers (1K, 1M) */
  compact?: boolean;
  /** Show both original and converted values */
  showBoth?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
}

export function CurrencyDisplay({
  amount,
  currencyCode,
  convert: shouldConvert = false,
  showCode = false,
  compact = false,
  showBoth = false,
  className = '',
  size = 'md',
  color = 'default',
}: CurrencyDisplayProps) {
  const {
    currencies,
    currentCurrency,
    baseCurrency,
    convert,
    format,
    formatWithCode,
  } = useCurrency();

  const sourceCurrency = useMemo(() => {
    if (!currencyCode) return baseCurrency;
    return currencies.find(c => c.code === currencyCode) || baseCurrency;
  }, [currencyCode, currencies, baseCurrency]);

  const displayAmount = useMemo(() => {
    if (!shouldConvert || sourceCurrency.code === currentCurrency.code) {
      return amount;
    }
    return convert(amount, sourceCurrency.code, currentCurrency.code);
  }, [amount, shouldConvert, sourceCurrency, currentCurrency, convert]);

  const formattedValue = useMemo(() => {
    const targetCurrency = shouldConvert ? currentCurrency : sourceCurrency;

    if (compact && Math.abs(displayAmount) >= 1000) {
      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      });
      const compactValue = formatter.format(displayAmount);

      if (showCode) {
        return `${compactValue} ${targetCurrency.code}`;
      }
      return targetCurrency.symbolPosition === 'after'
        ? `${compactValue} ${targetCurrency.symbol}`
        : `${targetCurrency.symbol}${compactValue}`;
    }

    if (showCode) {
      return formatWithCode(displayAmount, targetCurrency.code);
    }
    return format(displayAmount, targetCurrency.code);
  }, [displayAmount, shouldConvert, currentCurrency, sourceCurrency, compact, showCode, format, formatWithCode]);

  const originalValue = useMemo(() => {
    if (!showBoth || !shouldConvert || sourceCurrency.code === currentCurrency.code) {
      return null;
    }
    return format(amount, sourceCurrency.code);
  }, [showBoth, shouldConvert, sourceCurrency, currentCurrency, amount, format]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  // Color classes
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    muted: 'text-foreground/60',
  };

  return (
    <span className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      {formattedValue}
      {originalValue && (
        <span className="text-foreground/40 text-sm ml-1.5">
          ({originalValue})
        </span>
      )}
    </span>
  );
}

// Convenience components for common use cases
export function Price(props: CurrencyDisplayProps) {
  return <CurrencyDisplay {...props} />;
}

export function ConvertedPrice(props: Omit<CurrencyDisplayProps, 'convert'>) {
  return <CurrencyDisplay {...props} convert />;
}

export function CompactPrice(props: Omit<CurrencyDisplayProps, 'compact'>) {
  return <CurrencyDisplay {...props} compact />;
}
