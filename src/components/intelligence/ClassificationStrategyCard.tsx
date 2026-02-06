'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';
import { Clock, Cpu, FileText } from 'lucide-react';

interface ClassificationStrategyCardProps {
  abc: string;
  xyz: string;
}

export function ClassificationStrategyCard({ abc, xyz }: ClassificationStrategyCardProps) {
  const strategy = InventoryAnalyticsService.getStrategyRecommendation(abc, xyz);

  const comboLabel = `${abc}${xyz}`;
  const valueLabel = abc === 'A' ? 'High Value' : abc === 'B' ? 'Medium Value' : 'Low Value';
  const demandLabel = xyz === 'X' ? 'Stable Demand' : xyz === 'Y' ? 'Variable Demand' : 'Erratic Demand';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Strategy: {comboLabel}</CardTitle>
          <div className="flex gap-1">
            <Badge variant={abc === 'A' ? 'default' : abc === 'B' ? 'secondary' : 'outline'}>{valueLabel}</Badge>
            <Badge variant="outline">{demandLabel}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Policy</p>
            <p className="text-sm font-medium mt-0.5">{strategy.policy}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Review Frequency</p>
            <p className="text-sm font-medium mt-0.5">{strategy.reviewFrequency}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Cpu className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Automation Level</p>
            <p className="text-sm font-medium mt-0.5">{strategy.automation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
