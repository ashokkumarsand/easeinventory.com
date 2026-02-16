import prisma from '@/lib/prisma';
import { ForecastMethod, Prisma } from '@prisma/client';
import { OrderSmoothingService } from './order-smoothing.service';

// ============================================================
// Types
// ============================================================

export interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

export interface ForecastResult {
  method: ForecastMethod;
  forecast: ForecastPoint[];
  mape: number | null;
  mae: number | null;
  bias: number | null;
  rmse: number | null;
  parameters: Record<string, number>;
}

export interface ProductForecastSummary {
  productId: string;
  productName: string;
  sku: string | null;
  abcClass: string | null;
  currentStock: number;
  avgDailyDemand: number;
  forecastedDailyDemand: number;
  daysOfSupply: number;
  bestMethod: ForecastMethod | null;
  mape: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  forecastHorizonDays: number;
}

export interface ForecastDashboardResult {
  summary: {
    productsForecasted: number;
    avgMAPE: number;
    highConfidenceCount: number;
    methodDistribution: Record<string, number>;
  };
  aggregateForecast: ForecastPoint[];
  products: ProductForecastSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccuracyLeaderboardResult {
  best: { productId: string; productName: string; sku: string | null; mape: number; method: string }[];
  worst: { productId: string; productName: string; sku: string | null; mape: number; method: string }[];
  methodComparison: { method: string; avgMAPE: number; count: number }[];
}

// ============================================================
// Pure Math: Forecasting Algorithms (no DB calls)
// ============================================================

export class DemandForecastService {
  // ----------------------------------------------------------
  // SMA Forecast
  // ----------------------------------------------------------
  static forecastSMA(values: number[], horizon: number, window = 7): ForecastResult {
    if (values.length === 0) {
      return { method: 'SMA', forecast: [], mape: null, mae: null, bias: null, rmse: null, parameters: { window } };
    }
    const w = Math.min(window, values.length);
    const tail = values.slice(-w);
    const avg = tail.reduce((s, v) => s + v, 0) / w;

    const residuals = this.computeResiduals(values, (vals, i) => {
      const start = Math.max(0, i - w);
      const slice = vals.slice(start, i);
      return slice.length > 0 ? slice.reduce((s, v) => s + v, 0) / slice.length : 0;
    });
    const stdDev = this.stdDev(residuals);

    const forecast: ForecastPoint[] = [];
    const today = new Date();
    for (let d = 1; d <= horizon; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const bands = this.confidenceBands(avg, stdDev, d, horizon);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        value: Math.max(0, Math.round(avg * 100) / 100),
        lower: bands.lower,
        upper: bands.upper,
      });
    }

    const holdout = Math.min(Math.floor(values.length * 0.2), 14);
    const metrics = holdout >= 3 ? this.backtest(values, 'SMA', holdout, { window }) : null;

    return {
      method: 'SMA',
      forecast,
      mape: metrics?.mape ?? null,
      mae: metrics?.mae ?? null,
      bias: metrics?.bias ?? null,
      rmse: metrics?.rmse ?? null,
      parameters: { window },
    };
  }

  // ----------------------------------------------------------
  // EMA Forecast
  // ----------------------------------------------------------
  static forecastEMA(values: number[], horizon: number, alpha = 0.2): ForecastResult {
    if (values.length === 0) {
      return { method: 'EMA', forecast: [], mape: null, mae: null, bias: null, rmse: null, parameters: { alpha } };
    }
    const emaSeries = OrderSmoothingService.calculateEMASeries(values, alpha);
    const lastEMA = emaSeries[emaSeries.length - 1];

    const residuals = values.slice(1).map((v, i) => v - emaSeries[i]);
    const stdDev = this.stdDev(residuals);

    const forecast: ForecastPoint[] = [];
    const today = new Date();
    for (let d = 1; d <= horizon; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const bands = this.confidenceBands(lastEMA, stdDev, d, horizon);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        value: Math.max(0, Math.round(lastEMA * 100) / 100),
        lower: bands.lower,
        upper: bands.upper,
      });
    }

    const holdout = Math.min(Math.floor(values.length * 0.2), 14);
    const metrics = holdout >= 3 ? this.backtest(values, 'EMA', holdout, { alpha }) : null;

    return {
      method: 'EMA',
      forecast,
      mape: metrics?.mape ?? null,
      mae: metrics?.mae ?? null,
      bias: metrics?.bias ?? null,
      rmse: metrics?.rmse ?? null,
      parameters: { alpha },
    };
  }

  // ----------------------------------------------------------
  // Holt-Winters Triple Exponential Smoothing
  // ----------------------------------------------------------
  static forecastHoltWinters(
    values: number[],
    horizon: number,
    seasonLength?: number,
  ): ForecastResult {
    if (values.length < 14) {
      // Fallback to EMA for insufficient data
      return this.forecastEMA(values, horizon, 0.2);
    }

    // Determine season length: 7 (weekly) default, 365 if enough data
    const sLen = seasonLength ?? (values.length >= 365 ? 365 : 7);
    const useSeasonality = values.length >= sLen * 2; // Need at least 2 full seasons

    // Detect zero-heaviness — use additive if >30% zeros
    const zeroFrac = values.filter(v => v === 0).length / values.length;
    const multiplicative = zeroFrac <= 0.3 && useSeasonality;

    if (!useSeasonality) {
      // Holt double exponential (no seasonality)
      return this.forecastHoltDouble(values, horizon);
    }

    // Grid search for best parameters
    const candidates = [0.1, 0.3, 0.5, 0.7, 0.9];
    let bestParams = { alpha: 0.3, beta: 0.1, gamma: 0.1 };
    let bestMSE = Infinity;

    const holdout = Math.min(Math.floor(values.length * 0.15), 14);
    const trainLen = values.length - holdout;

    if (trainLen > sLen * 2) {
      for (const a of candidates) {
        for (const b of [0.1, 0.3, 0.5]) {
          for (const g of [0.1, 0.3, 0.5]) {
            const fitted = multiplicative
              ? this.hwMultiplicative(values.slice(0, trainLen), holdout, sLen, a, b, g)
              : this.hwAdditive(values.slice(0, trainLen), holdout, sLen, a, b, g);
            if (!fitted) continue;

            const actuals = values.slice(trainLen);
            let mse = 0;
            const n = Math.min(fitted.length, actuals.length);
            for (let i = 0; i < n; i++) {
              mse += (fitted[i] - actuals[i]) ** 2;
            }
            mse /= n;
            if (mse < bestMSE) {
              bestMSE = mse;
              bestParams = { alpha: a, beta: b, gamma: g };
            }
          }
        }
      }
    }

    // Run full model with best params
    const { alpha, beta, gamma } = bestParams;
    const fitted = multiplicative
      ? this.hwMultiplicative(values, horizon, sLen, alpha, beta, gamma)
      : this.hwAdditive(values, horizon, sLen, alpha, beta, gamma);

    if (!fitted || fitted.length === 0) {
      return this.forecastHoltDouble(values, horizon);
    }

    // Compute residuals on training data for confidence bands
    const inSampleFitted = multiplicative
      ? this.hwMultiplicativeFitted(values, sLen, alpha, beta, gamma)
      : this.hwAdditiveFitted(values, sLen, alpha, beta, gamma);
    const residuals = values.slice(sLen).map((v, i) => v - (inSampleFitted[i + sLen] ?? v));
    const stdDev = this.stdDev(residuals);

    const forecast: ForecastPoint[] = [];
    const today = new Date();
    for (let d = 0; d < horizon; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d + 1);
      const val = Math.max(0, fitted[d]);
      const bands = this.confidenceBands(val, stdDev, d + 1, horizon);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        value: Math.round(val * 100) / 100,
        lower: bands.lower,
        upper: bands.upper,
      });
    }

    const metrics = holdout >= 3 ? this.backtest(values, 'HOLT_WINTERS', holdout, { alpha, beta, gamma, seasonLength: sLen }) : null;

    return {
      method: 'HOLT_WINTERS',
      forecast,
      mape: metrics?.mape ?? null,
      mae: metrics?.mae ?? null,
      bias: metrics?.bias ?? null,
      rmse: metrics?.rmse ?? null,
      parameters: { alpha, beta, gamma, seasonLength: sLen, multiplicative: multiplicative ? 1 : 0 },
    };
  }

  // Holt Double Exponential (no seasonality)
  private static forecastHoltDouble(values: number[], horizon: number): ForecastResult {
    const alpha = 0.3;
    const beta = 0.1;

    let level = values[0];
    let trend = values.length > 1 ? values[1] - values[0] : 0;
    const fitted: number[] = [level];

    for (let i = 1; i < values.length; i++) {
      const newLevel = alpha * values[i] + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      level = newLevel;
      trend = newTrend;
      fitted.push(level + trend);
    }

    const residuals = values.map((v, i) => v - fitted[i]);
    const stdDev = this.stdDev(residuals);

    const forecast: ForecastPoint[] = [];
    const today = new Date();
    for (let d = 1; d <= horizon; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const val = Math.max(0, level + trend * d);
      const bands = this.confidenceBands(val, stdDev, d, horizon);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        value: Math.round(val * 100) / 100,
        lower: bands.lower,
        upper: bands.upper,
      });
    }

    const holdout = Math.min(Math.floor(values.length * 0.2), 14);
    const metrics = holdout >= 3 ? this.backtest(values, 'HOLT_WINTERS', holdout, { alpha, beta, gamma: 0, seasonLength: 0 }) : null;

    return {
      method: 'HOLT_WINTERS',
      forecast,
      mape: metrics?.mape ?? null,
      mae: metrics?.mae ?? null,
      bias: metrics?.bias ?? null,
      rmse: metrics?.rmse ?? null,
      parameters: { alpha, beta, gamma: 0, seasonLength: 0, multiplicative: 0 },
    };
  }

  // Holt-Winters Additive model — returns horizon forecast values
  private static hwAdditive(data: number[], horizon: number, sLen: number, alpha: number, beta: number, gamma: number): number[] | null {
    const n = data.length;
    if (n < sLen * 2) return null;

    // Initialize
    let level = data.slice(0, sLen).reduce((s, v) => s + v, 0) / sLen;
    let trend = 0;
    for (let i = 0; i < sLen; i++) {
      trend += (data[sLen + i] - data[i]) / sLen;
    }
    trend /= sLen;

    const seasonal: number[] = new Array(n + horizon);
    for (let i = 0; i < sLen; i++) {
      seasonal[i] = data[i] - level;
    }

    // Fit
    for (let i = sLen; i < n; i++) {
      const newLevel = alpha * (data[i] - seasonal[i - sLen]) + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      seasonal[i] = gamma * (data[i] - newLevel) + (1 - gamma) * seasonal[i - sLen];
      level = newLevel;
      trend = newTrend;
    }

    // Forecast
    const result: number[] = [];
    for (let h = 1; h <= horizon; h++) {
      const sIdx = n - sLen + ((h - 1) % sLen);
      result.push(level + trend * h + seasonal[sIdx]);
    }
    return result;
  }

  // Holt-Winters Multiplicative model
  private static hwMultiplicative(data: number[], horizon: number, sLen: number, alpha: number, beta: number, gamma: number): number[] | null {
    const n = data.length;
    if (n < sLen * 2) return null;

    let level = data.slice(0, sLen).reduce((s, v) => s + v, 0) / sLen;
    if (level === 0) level = 0.01;

    let trend = 0;
    for (let i = 0; i < sLen; i++) {
      trend += (data[sLen + i] - data[i]) / sLen;
    }
    trend /= sLen;

    const seasonal: number[] = new Array(n + horizon);
    for (let i = 0; i < sLen; i++) {
      seasonal[i] = level > 0 ? data[i] / level : 1;
    }

    for (let i = sLen; i < n; i++) {
      const sPrev = seasonal[i - sLen] || 1;
      const newLevel = alpha * (data[i] / sPrev) + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      seasonal[i] = gamma * (data[i] / (newLevel || 0.01)) + (1 - gamma) * sPrev;
      level = newLevel;
      trend = newTrend;
    }

    const result: number[] = [];
    for (let h = 1; h <= horizon; h++) {
      const sIdx = n - sLen + ((h - 1) % sLen);
      result.push((level + trend * h) * (seasonal[sIdx] || 1));
    }
    return result;
  }

  // In-sample fitted values for residual calculation (additive)
  private static hwAdditiveFitted(data: number[], sLen: number, alpha: number, beta: number, gamma: number): number[] {
    const n = data.length;
    const fitted: number[] = new Array(n).fill(0);

    let level = data.slice(0, sLen).reduce((s, v) => s + v, 0) / sLen;
    let trend = 0;
    for (let i = 0; i < sLen; i++) trend += (data[sLen + i] - data[i]) / sLen;
    trend /= sLen;

    const seasonal: number[] = [];
    for (let i = 0; i < sLen; i++) {
      seasonal[i] = data[i] - level;
      fitted[i] = level + seasonal[i];
    }

    for (let i = sLen; i < n; i++) {
      fitted[i] = level + trend + seasonal[i - sLen];
      const newLevel = alpha * (data[i] - seasonal[i - sLen]) + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      seasonal[i] = gamma * (data[i] - newLevel) + (1 - gamma) * seasonal[i - sLen];
      level = newLevel;
      trend = newTrend;
    }
    return fitted;
  }

  // In-sample fitted values (multiplicative)
  private static hwMultiplicativeFitted(data: number[], sLen: number, alpha: number, beta: number, gamma: number): number[] {
    const n = data.length;
    const fitted: number[] = new Array(n).fill(0);

    let level = data.slice(0, sLen).reduce((s, v) => s + v, 0) / sLen;
    if (level === 0) level = 0.01;
    let trend = 0;
    for (let i = 0; i < sLen; i++) trend += (data[sLen + i] - data[i]) / sLen;
    trend /= sLen;

    const seasonal: number[] = [];
    for (let i = 0; i < sLen; i++) {
      seasonal[i] = level > 0 ? data[i] / level : 1;
      fitted[i] = level * seasonal[i];
    }

    for (let i = sLen; i < n; i++) {
      const sPrev = seasonal[i - sLen] || 1;
      fitted[i] = (level + trend) * sPrev;
      const newLevel = alpha * (data[i] / sPrev) + (1 - alpha) * (level + trend);
      const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
      seasonal[i] = gamma * (data[i] / (newLevel || 0.01)) + (1 - gamma) * sPrev;
      level = newLevel;
      trend = newTrend;
    }
    return fitted;
  }

  // ----------------------------------------------------------
  // Linear Regression Forecast
  // ----------------------------------------------------------
  static forecastLinearRegression(values: number[], horizon: number): ForecastResult {
    if (values.length < 3) {
      return { method: 'LINEAR_REGRESSION', forecast: [], mape: null, mae: null, bias: null, rmse: null, parameters: {} };
    }

    const n = values.length;
    // x = 0..n-1, y = values
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;

    // R² calculation
    const yMean = sumY / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = a + b * i;
      ssRes += (values[i] - predicted) ** 2;
      ssTot += (values[i] - yMean) ** 2;
    }
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    const residuals = values.map((v, i) => v - (a + b * i));
    const stdDev = this.stdDev(residuals);

    const forecast: ForecastPoint[] = [];
    const today = new Date();
    for (let d = 1; d <= horizon; d++) {
      const x = n + d - 1;
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const val = Math.max(0, a + b * x);
      const bands = this.confidenceBands(val, stdDev, d, horizon);
      forecast.push({
        date: date.toISOString().slice(0, 10),
        value: Math.round(val * 100) / 100,
        lower: bands.lower,
        upper: bands.upper,
      });
    }

    const holdout = Math.min(Math.floor(values.length * 0.2), 14);
    const metrics = holdout >= 3 ? this.backtest(values, 'LINEAR_REGRESSION', holdout, { a, b }) : null;

    return {
      method: 'LINEAR_REGRESSION',
      forecast,
      mape: metrics?.mape ?? null,
      mae: metrics?.mae ?? null,
      bias: metrics?.bias ?? null,
      rmse: metrics?.rmse ?? null,
      parameters: { slope: Math.round(b * 10000) / 10000, intercept: Math.round(a * 100) / 100, rSquared: Math.round(rSquared * 1000) / 1000 },
    };
  }

  // ----------------------------------------------------------
  // Ensemble Forecast (weight by inverse MAPE)
  // ----------------------------------------------------------
  static forecastEnsemble(forecasts: ForecastResult[], horizon: number): ForecastResult {
    const valid = forecasts.filter(f => f.forecast.length > 0 && f.mape !== null && f.mape > 0 && isFinite(f.mape));
    if (valid.length === 0) {
      // Fallback: equal-weight all available
      const all = forecasts.filter(f => f.forecast.length > 0);
      if (all.length === 0) {
        return { method: 'ENSEMBLE', forecast: [], mape: null, mae: null, bias: null, rmse: null, parameters: {} };
      }
      return this.equalWeightEnsemble(all, horizon);
    }

    // Inverse-MAPE weighting
    const invMapes = valid.map(f => 1 / (f.mape! + 0.01));
    const totalWeight = invMapes.reduce((s, w) => s + w, 0);
    const weights = invMapes.map(w => w / totalWeight);

    const forecast: ForecastPoint[] = [];
    for (let d = 0; d < horizon; d++) {
      let val = 0, lower = 0, upper = 0;
      let date = '';
      for (let m = 0; m < valid.length; m++) {
        if (d < valid[m].forecast.length) {
          val += weights[m] * valid[m].forecast[d].value;
          lower += weights[m] * valid[m].forecast[d].lower;
          upper += weights[m] * valid[m].forecast[d].upper;
          date = valid[m].forecast[d].date;
        }
      }
      forecast.push({
        date,
        value: Math.max(0, Math.round(val * 100) / 100),
        lower: Math.max(0, Math.round(lower * 100) / 100),
        upper: Math.round(upper * 100) / 100,
      });
    }

    // Ensemble metrics: weighted average of component metrics
    const avgMAPE = valid.reduce((s, f, i) => s + weights[i] * (f.mape ?? 0), 0);
    const avgMAE = valid.reduce((s, f, i) => s + weights[i] * (f.mae ?? 0), 0);
    const avgBias = valid.reduce((s, f, i) => s + weights[i] * (f.bias ?? 0), 0);
    const avgRMSE = valid.reduce((s, f, i) => s + weights[i] * (f.rmse ?? 0), 0);

    const weightMap: Record<string, number> = {};
    valid.forEach((f, i) => { weightMap[f.method] = Math.round(weights[i] * 1000) / 1000; });

    return {
      method: 'ENSEMBLE',
      forecast,
      mape: Math.round(avgMAPE * 100) / 100,
      mae: Math.round(avgMAE * 100) / 100,
      bias: Math.round(avgBias * 100) / 100,
      rmse: Math.round(avgRMSE * 100) / 100,
      parameters: { weights: 1, ...weightMap },
    };
  }

  private static equalWeightEnsemble(forecasts: ForecastResult[], horizon: number): ForecastResult {
    const forecast: ForecastPoint[] = [];
    const n = forecasts.length;
    for (let d = 0; d < horizon; d++) {
      let val = 0, lower = 0, upper = 0;
      let date = '', count = 0;
      for (const f of forecasts) {
        if (d < f.forecast.length) {
          val += f.forecast[d].value;
          lower += f.forecast[d].lower;
          upper += f.forecast[d].upper;
          date = f.forecast[d].date;
          count++;
        }
      }
      if (count > 0) {
        forecast.push({
          date,
          value: Math.max(0, Math.round((val / count) * 100) / 100),
          lower: Math.max(0, Math.round((lower / count) * 100) / 100),
          upper: Math.round((upper / count) * 100) / 100,
        });
      }
    }
    return { method: 'ENSEMBLE', forecast, mape: null, mae: null, bias: null, rmse: null, parameters: { equalWeight: 1 } };
  }

  // ----------------------------------------------------------
  // Confidence Bands — 80% CI widening with horizon
  // ----------------------------------------------------------
  static confidenceBands(value: number, stdDev: number, step: number, _horizon: number, z = 1.28) {
    const widening = Math.sqrt(step); // Uncertainty grows with √t
    const margin = z * stdDev * widening;
    return {
      lower: Math.max(0, Math.round((value - margin) * 100) / 100),
      upper: Math.round((value + margin) * 100) / 100,
    };
  }

  // ----------------------------------------------------------
  // Accuracy Metrics
  // ----------------------------------------------------------
  static calculateMAPE(actuals: number[], predicted: number[]): number {
    const n = Math.min(actuals.length, predicted.length);
    if (n === 0) return 0;
    let sum = 0, count = 0;
    for (let i = 0; i < n; i++) {
      if (actuals[i] !== 0) {
        sum += Math.abs((actuals[i] - predicted[i]) / actuals[i]);
        count++;
      }
    }
    return count > 0 ? Math.round((sum / count) * 10000) / 100 : 0; // percentage
  }

  static calculateMAE(actuals: number[], predicted: number[]): number {
    const n = Math.min(actuals.length, predicted.length);
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(actuals[i] - predicted[i]);
    return Math.round((sum / n) * 100) / 100;
  }

  static calculateBias(actuals: number[], predicted: number[]): number {
    const n = Math.min(actuals.length, predicted.length);
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += predicted[i] - actuals[i];
    return Math.round((sum / n) * 100) / 100;
  }

  static calculateRMSE(actuals: number[], predicted: number[]): number {
    const n = Math.min(actuals.length, predicted.length);
    if (n === 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += (actuals[i] - predicted[i]) ** 2;
    return Math.round(Math.sqrt(sum / n) * 100) / 100;
  }

  // ----------------------------------------------------------
  // Backtest — hold-out evaluation
  // ----------------------------------------------------------
  static backtest(
    values: number[],
    method: ForecastMethod | string,
    holdoutDays: number,
    params: Record<string, number> = {},
  ): { mape: number; mae: number; bias: number; rmse: number } {
    if (values.length <= holdoutDays + 3) {
      return { mape: 0, mae: 0, bias: 0, rmse: 0 };
    }

    const train = values.slice(0, -holdoutDays);
    const actuals = values.slice(-holdoutDays);

    let predicted: number[];

    switch (method) {
      case 'SMA': {
        const w = params.window ?? 7;
        const avg = train.slice(-Math.min(w, train.length)).reduce((s, v) => s + v, 0) / Math.min(w, train.length);
        predicted = actuals.map(() => avg);
        break;
      }
      case 'EMA': {
        const a = params.alpha ?? 0.2;
        const ema = OrderSmoothingService.calculateEMASeries(train, a);
        const last = ema[ema.length - 1];
        predicted = actuals.map(() => last);
        break;
      }
      case 'HOLT_WINTERS': {
        const sLen = params.seasonLength ?? 7;
        const multi = (params.multiplicative ?? 0) > 0;
        if (sLen > 0 && train.length >= sLen * 2) {
          const hw = multi
            ? this.hwMultiplicative(train, holdoutDays, sLen, params.alpha ?? 0.3, params.beta ?? 0.1, params.gamma ?? 0.1)
            : this.hwAdditive(train, holdoutDays, sLen, params.alpha ?? 0.3, params.beta ?? 0.1, params.gamma ?? 0.1);
          predicted = hw ?? actuals.map(() => 0);
        } else {
          // Holt double
          let level = train[0];
          let trend = train.length > 1 ? train[1] - train[0] : 0;
          const alpha = params.alpha ?? 0.3;
          const beta = params.beta ?? 0.1;
          for (let i = 1; i < train.length; i++) {
            const nl = alpha * train[i] + (1 - alpha) * (level + trend);
            const nt = beta * (nl - level) + (1 - beta) * trend;
            level = nl;
            trend = nt;
          }
          predicted = actuals.map((_, i) => Math.max(0, level + trend * (i + 1)));
        }
        break;
      }
      case 'LINEAR_REGRESSION': {
        const n = train.length;
        let sX = 0, sY = 0, sXY = 0, sX2 = 0;
        for (let i = 0; i < n; i++) { sX += i; sY += train[i]; sXY += i * train[i]; sX2 += i * i; }
        const bb = (n * sXY - sX * sY) / (n * sX2 - sX * sX);
        const aa = (sY - bb * sX) / n;
        predicted = actuals.map((_, i) => Math.max(0, aa + bb * (n + i)));
        break;
      }
      default:
        predicted = actuals.map(() => 0);
    }

    return {
      mape: this.calculateMAPE(actuals, predicted),
      mae: this.calculateMAE(actuals, predicted),
      bias: this.calculateBias(actuals, predicted),
      rmse: this.calculateRMSE(actuals, predicted),
    };
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  private static stdDev(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  private static computeResiduals(values: number[], predictFn: (vals: number[], index: number) => number): number[] {
    const residuals: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const pred = predictFn(values, i);
      residuals.push(values[i] - pred);
    }
    return residuals;
  }

  // ============================================================
  // Persistence Layer — DB-backed methods (BL-T3)
  // ============================================================

  /**
   * Get daily demand data for a product (reuse order-smoothing infrastructure)
   */
  static async getDailyDemand(productId: string, tenantId: string, lookbackDays: number) {
    return OrderSmoothingService.getDailyDemandArray(productId, tenantId, lookbackDays);
  }

  /**
   * Determine which methods to run based on data availability
   */
  static getApplicableMethods(dataPoints: number): ForecastMethod[] {
    if (dataPoints < 7) return ['SMA'];
    if (dataPoints < 14) return ['SMA', 'EMA'];
    if (dataPoints < 30) return ['SMA', 'EMA', 'LINEAR_REGRESSION'];
    return ['SMA', 'EMA', 'HOLT_WINTERS', 'LINEAR_REGRESSION'];
  }

  /**
   * Run all applicable methods, backtest, pick lowest MAPE
   */
  static autoSelectBestMethod(
    values: number[],
    horizon: number,
  ): { best: ForecastResult; all: ForecastResult[] } {
    const methods = this.getApplicableMethods(values.length);
    const results: ForecastResult[] = [];

    for (const method of methods) {
      switch (method) {
        case 'SMA':
          results.push(this.forecastSMA(values, horizon, Math.min(7, values.length)));
          break;
        case 'EMA':
          results.push(this.forecastEMA(values, horizon, 0.2));
          break;
        case 'HOLT_WINTERS':
          results.push(this.forecastHoltWinters(values, horizon));
          break;
        case 'LINEAR_REGRESSION':
          results.push(this.forecastLinearRegression(values, horizon));
          break;
      }
    }

    // Add ensemble if we have 2+ methods with MAPE
    if (results.filter(r => r.mape !== null && r.mape > 0).length >= 2) {
      results.push(this.forecastEnsemble(results, horizon));
    }

    // Pick best by lowest MAPE
    let best = results[0];
    for (const r of results) {
      if (r.mape !== null && r.mape > 0 && (best.mape === null || best.mape === 0 || r.mape < best.mape)) {
        best = r;
      }
    }

    return { best, all: results };
  }

  /**
   * Generate and persist forecasts for a single product
   */
  static async generateForProduct(
    productId: string,
    tenantId: string,
    horizon = 30,
    lookback = 90,
  ) {
    const { values } = await this.getDailyDemand(productId, tenantId, lookback);
    if (values.length < 3) return null;

    const { best, all } = this.autoSelectBestMethod(values, horizon);

    // Deactivate old forecasts
    await prisma.demandForecast.updateMany({
      where: { productId, tenantId, isActive: true },
      data: { isActive: false, isBest: false },
    });

    // Persist all method results
    const creates: Prisma.DemandForecastCreateManyInput[] = all.map(r => ({
      productId,
      tenantId,
      method: r.method,
      horizonDays: horizon,
      forecastData: r.forecast as unknown as Prisma.InputJsonValue,
      mape: r.mape,
      mae: r.mae,
      bias: r.bias,
      rmse: r.rmse,
      parameters: r.parameters as unknown as Prisma.InputJsonValue,
      isActive: true,
      isBest: r.method === best.method,
    }));

    await prisma.demandForecast.createMany({ data: creates });

    return { productId, bestMethod: best.method, mape: best.mape, methodCount: all.length };
  }

  /**
   * Generate forecasts for all active products in a tenant (batched)
   */
  static async generateForTenant(
    tenantId: string,
    horizon = 30,
    lookback = 90,
  ) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
    });

    let generated = 0;
    let failed = 0;

    // Process in batches of 50
    for (let i = 0; i < products.length; i += 50) {
      const batch = products.slice(i, i + 50);
      const results = await Promise.allSettled(
        batch.map(p => this.generateForProduct(p.id, tenantId, horizon, lookback)),
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) generated++;
        else failed++;
      }
    }

    return { generated, failed, total: products.length };
  }

  /**
   * Get the best active forecast for a product
   */
  static async getProductForecast(productId: string, tenantId: string) {
    return prisma.demandForecast.findFirst({
      where: { productId, tenantId, isActive: true, isBest: true },
      include: { product: { select: { id: true, name: true, sku: true, quantity: true, abcClass: true } } },
    });
  }

  /**
   * Get all active forecasts for a product (all methods)
   */
  static async getProductForecasts(productId: string, tenantId: string) {
    const forecasts = await prisma.demandForecast.findMany({
      where: { productId, tenantId, isActive: true },
      include: { product: { select: { id: true, name: true, sku: true, quantity: true, abcClass: true, leadTimeDays: true, reorderPoint: true, safetyStock: true } } },
      orderBy: { mape: 'asc' },
    });

    // Get historical demand for the chart
    const lookback = forecasts[0]?.horizonDays ? Math.max(forecasts[0].horizonDays * 3, 90) : 90;
    const { dates, values } = await this.getDailyDemand(productId, tenantId, lookback);
    const historical = dates.map((d, i) => ({ date: d, value: values[i] }));

    // Get accuracy history
    const accuracyLogs = await prisma.forecastAccuracyLog.findMany({
      where: { productId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { forecasts, historical, accuracyLogs };
  }

  /**
   * Dashboard: summaries + product table + aggregate
   */
  static async getDashboard(
    tenantId: string,
    filter: { search?: string; abcClass?: string } = {},
    page = 1,
    pageSize = 25,
  ): Promise<ForecastDashboardResult> {
    const where: Prisma.DemandForecastWhereInput = {
      tenantId,
      isActive: true,
      isBest: true,
      ...(filter.search && {
        product: {
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { sku: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
      }),
      ...(filter.abcClass && { product: { abcClass: filter.abcClass } }),
    };

    const [forecasts, total] = await Promise.all([
      prisma.demandForecast.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, quantity: true, abcClass: true, leadTimeDays: true } },
        },
        orderBy: { mape: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.demandForecast.count({ where }),
    ]);

    // Aggregate stats
    const allBest = await prisma.demandForecast.findMany({
      where: { tenantId, isActive: true, isBest: true },
      select: { mape: true, method: true, forecastData: true },
    });

    const validMAPEs = allBest.filter(f => f.mape !== null && f.mape > 0).map(f => f.mape!);
    const avgMAPE = validMAPEs.length > 0 ? validMAPEs.reduce((s, v) => s + v, 0) / validMAPEs.length : 0;
    const highConfidenceCount = validMAPEs.filter(m => m < 10).length;

    const methodDist: Record<string, number> = {};
    for (const f of allBest) {
      methodDist[f.method] = (methodDist[f.method] ?? 0) + 1;
    }

    // Build aggregate forecast (sum all product forecasts)
    const aggregateForecast = this.computeAggregateForecast(allBest);

    // Build product summaries
    const products: ProductForecastSummary[] = forecasts.map(f => {
      const raw = f.forecastData as unknown;
      const data = Array.isArray(raw) ? (raw as ForecastPoint[]) : [];
      const forecastAvg = data.length > 0 ? data.reduce((s, p) => s + (p.value ?? 0), 0) / data.length : 0;
      const leadTime = f.product.leadTimeDays ?? 7;
      const daysOfSupply = forecastAvg > 0 ? Math.floor(f.product.quantity / forecastAvg) : 999;

      return {
        productId: f.product.id,
        productName: f.product.name,
        sku: f.product.sku,
        abcClass: f.product.abcClass,
        currentStock: f.product.quantity,
        avgDailyDemand: forecastAvg,
        forecastedDailyDemand: forecastAvg,
        daysOfSupply,
        bestMethod: f.method,
        mape: f.mape,
        confidence: f.mape !== null ? (f.mape < 10 ? 'HIGH' : f.mape < 30 ? 'MEDIUM' : 'LOW') : null,
        forecastHorizonDays: f.horizonDays,
      };
    });

    return {
      summary: {
        productsForecasted: allBest.length,
        avgMAPE: Math.round(avgMAPE * 100) / 100,
        highConfidenceCount,
        methodDistribution: methodDist,
      },
      aggregateForecast,
      products,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Sum all active best forecasts into one aggregate
   */
  private static computeAggregateForecast(
    forecasts: { forecastData: unknown }[],
  ): ForecastPoint[] {
    const dateMap = new Map<string, { value: number; lower: number; upper: number }>();

    for (const f of forecasts) {
      const data = f.forecastData as ForecastPoint[];
      if (!Array.isArray(data)) continue;
      for (const point of data) {
        const existing = dateMap.get(point.date);
        if (existing) {
          existing.value += point.value;
          existing.lower += point.lower;
          existing.upper += point.upper;
        } else {
          dateMap.set(point.date, { value: point.value, lower: point.lower, upper: point.upper });
        }
      }
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        value: Math.round(v.value * 100) / 100,
        lower: Math.round(v.lower * 100) / 100,
        upper: Math.round(v.upper * 100) / 100,
      }));
  }

  /**
   * Accuracy leaderboard: best/worst products + method comparison
   */
  static async getAccuracyLeaderboard(tenantId: string): Promise<AccuracyLeaderboardResult> {
    const forecasts = await prisma.demandForecast.findMany({
      where: { tenantId, isActive: true, isBest: true, mape: { not: null, gt: 0 } },
      include: { product: { select: { id: true, name: true, sku: true } } },
      orderBy: { mape: 'asc' },
    });

    const best = forecasts.slice(0, 10).map(f => ({
      productId: f.product.id,
      productName: f.product.name,
      sku: f.product.sku,
      mape: f.mape!,
      method: f.method,
    }));

    const worst = forecasts.slice(-10).reverse().map(f => ({
      productId: f.product.id,
      productName: f.product.name,
      sku: f.product.sku,
      mape: f.mape!,
      method: f.method,
    }));

    // Method comparison
    const allForecasts = await prisma.demandForecast.findMany({
      where: { tenantId, isActive: true, mape: { not: null, gt: 0 } },
      select: { method: true, mape: true },
    });

    const methodStats = new Map<string, { sum: number; count: number }>();
    for (const f of allForecasts) {
      const s = methodStats.get(f.method) ?? { sum: 0, count: 0 };
      s.sum += f.mape!;
      s.count++;
      methodStats.set(f.method, s);
    }

    const methodComparison = Array.from(methodStats.entries()).map(([method, s]) => ({
      method,
      avgMAPE: Math.round((s.sum / s.count) * 100) / 100,
      count: s.count,
    })).sort((a, b) => a.avgMAPE - b.avgMAPE);

    return { best, worst, methodComparison };
  }

  /**
   * Get aggregate forecast across all products
   */
  static async getAggregateForecast(tenantId: string) {
    const forecasts = await prisma.demandForecast.findMany({
      where: { tenantId, isActive: true, isBest: true },
      select: { forecastData: true },
    });
    return this.computeAggregateForecast(forecasts);
  }

  /**
   * Evaluate accuracy of past forecasts vs actual demand
   */
  static async evaluateAccuracy(tenantId: string) {
    // Find forecasts made > 7 days ago that we can evaluate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pastForecasts = await prisma.demandForecast.findMany({
      where: {
        tenantId,
        createdAt: { lte: sevenDaysAgo },
        isActive: false, // Already replaced by newer forecasts
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    let evaluated = 0;
    const logs: Prisma.ForecastAccuracyLogCreateManyInput[] = [];

    for (const forecast of pastForecasts) {
      const data = forecast.forecastData as unknown as ForecastPoint[];
      if (!Array.isArray(data) || data.length === 0) continue;

      const startDate = data[0].date;
      const endDate = data[data.length - 1].date;

      // Get actual demand for the forecast period
      const { dates, values } = await this.getDailyDemand(
        forecast.productId,
        tenantId,
        Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (86400000)) + 1,
      );

      // Align predicted vs actual
      const dateValueMap = new Map(dates.map((d, i) => [d, values[i]]));
      const actuals: number[] = [];
      const predicted: number[] = [];
      for (const point of data) {
        const actual = dateValueMap.get(point.date);
        if (actual !== undefined) {
          actuals.push(actual);
          predicted.push(point.value);
        }
      }

      if (actuals.length < 3) continue;

      const mape = this.calculateMAPE(actuals, predicted);
      const mae = this.calculateMAE(actuals, predicted);
      const bias = this.calculateBias(actuals, predicted);
      const rmse = this.calculateRMSE(actuals, predicted);

      logs.push({
        productId: forecast.productId,
        tenantId,
        method: forecast.method,
        periodStart: new Date(startDate),
        periodEnd: new Date(endDate),
        mape, mae, bias, rmse,
        dataPoints: actuals.length,
      });
      evaluated++;
    }

    if (logs.length > 0) {
      await prisma.forecastAccuracyLog.createMany({ data: logs });
    }

    return { evaluated, logged: logs.length };
  }

  /**
   * Get forecasted average daily demand for a product (used by safety stock integration)
   */
  static async getForecastedDailyDemand(productId: string, tenantId: string): Promise<number | null> {
    const forecast = await prisma.demandForecast.findFirst({
      where: { productId, tenantId, isActive: true, isBest: true },
      select: { forecastData: true },
    });
    if (!forecast) return null;
    const data = forecast.forecastData as unknown as ForecastPoint[];
    if (!Array.isArray(data) || data.length === 0) return null;
    return data.reduce((s, p) => s + p.value, 0) / data.length;
  }
}
