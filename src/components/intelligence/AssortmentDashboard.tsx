'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AssortmentOverview } from './AssortmentOverview';
import { AssortmentScoresTable } from './AssortmentScoresTable';
import { CategoryAnalysis } from './CategoryAnalysis';
import { AssortmentSuggestions } from './AssortmentSuggestions';

const SUB_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'scores', label: 'Product Scores' },
  { value: 'categories', label: 'Categories' },
  { value: 'suggestions', label: 'Suggestions' },
] as const;

type SubTab = typeof SUB_TABS[number]['value'];

export function AssortmentDashboard() {
  const [activeTab, setActiveTab] = useState<SubTab>('overview');

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2">
        {SUB_TABS.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <AssortmentOverview />}
      {activeTab === 'scores' && <AssortmentScoresTable />}
      {activeTab === 'categories' && <CategoryAnalysis />}
      {activeTab === 'suggestions' && <AssortmentSuggestions />}
    </div>
  );
}
