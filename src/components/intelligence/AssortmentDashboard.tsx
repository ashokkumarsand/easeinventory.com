'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export function AssortmentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {SUB_TABS.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <AssortmentOverview />
      </TabsContent>
      <TabsContent value="scores" className="mt-6">
        <AssortmentScoresTable />
      </TabsContent>
      <TabsContent value="categories" className="mt-6">
        <CategoryAnalysis />
      </TabsContent>
      <TabsContent value="suggestions" className="mt-6">
        <AssortmentSuggestions />
      </TabsContent>
    </Tabs>
  );
}
