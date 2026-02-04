'use client';

import { ChartSkeleton, StatCardsSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@heroui/react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="w-48 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-80 h-4 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <StatCardsSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-card border border-soft space-y-4">
        <Skeleton className="w-40 h-6 rounded-lg" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-4 rounded" />
              <Skeleton className="w-1/2 h-3 rounded" />
            </div>
            <Skeleton className="w-16 h-5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
