'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Minus, TrendingUp, Tag, Lightbulb } from 'lucide-react';

interface Suggestion {
  action: string;
  productId: string | null;
  productName: string | null;
  categoryName: string | null;
  reason: string;
  impact: string;
  score: number | null;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  ADD: { icon: <Plus className="w-4 h-4" />, color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Add to Assortment' },
  REMOVE: { icon: <Minus className="w-4 h-4" />, color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Remove from Assortment' },
  PROMOTE: { icon: <TrendingUp className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Promote' },
  MARKDOWN: { icon: <Tag className="w-4 h-4" />, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Markdown' },
};

const IMPACT_COLOR: Record<string, string> = {
  HIGH: 'bg-red-500/10 text-red-600 border-red-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  LOW: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function AssortmentSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/assortment/suggestions');
      const json = await res.json();
      setSuggestions(json.suggestions || []);
    } catch (e) {
      console.error('Failed to fetch assortment suggestions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Generating suggestions...
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Lightbulb className="w-10 h-10 mb-3 opacity-50" />
          <p className="font-medium">No suggestions</p>
          <p className="text-sm mt-1">Your assortment looks well-optimized</p>
        </CardContent>
      </Card>
    );
  }

  // Group by action
  const grouped = suggestions.reduce((acc, s) => {
    if (!acc[s.action]) acc[s.action] = [];
    acc[s.action].push(s);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  const actionOrder = ['ADD', 'PROMOTE', 'MARKDOWN', 'REMOVE'];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {actionOrder.map(action => {
          const items = grouped[action];
          if (!items?.length) return null;
          const config = ACTION_CONFIG[action];
          return (
            <Badge key={action} variant="outline" className={`${config.color} text-sm px-3 py-1.5 gap-1.5`}>
              {config.icon}
              {config.label}: {items.length}
            </Badge>
          );
        })}
      </div>

      {/* Grouped Cards */}
      {actionOrder.map(action => {
        const items = grouped[action];
        if (!items?.length) return null;
        const config = ACTION_CONFIG[action];

        return (
          <Card key={action}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {config.icon}
                {config.label}
                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {s.productName || s.categoryName || 'Category suggestion'}
                      </span>
                      <Badge variant="outline" className={`${IMPACT_COLOR[s.impact]} text-[10px] shrink-0`}>
                        {s.impact}
                      </Badge>
                      {s.score !== null && (
                        <span className="text-xs text-muted-foreground shrink-0">Score: {s.score}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{s.reason}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
