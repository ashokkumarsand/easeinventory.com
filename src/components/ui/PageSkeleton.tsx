'use client';

import { Skeleton } from '@heroui/react';

/**
 * Reusable skeleton components for loading states
 */

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-soft space-y-3">
      <Skeleton className="w-24 h-3 rounded-lg" />
      <Skeleton className="w-32 h-8 rounded-lg" />
      <Skeleton className="w-20 h-4 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-soft bg-card">
      {/* Header */}
      <div className="p-4 border-b border-soft flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 rounded-lg flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-soft/50 flex gap-4 items-center">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4 rounded-lg" />
            <Skeleton className="w-1/2 h-3 rounded-lg" />
          </div>
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="w-48 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-64 h-4 rounded-lg" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-24 h-10 rounded-2xl" />
        <Skeleton className="w-32 h-10 rounded-full" />
      </div>
    </div>
  );
}

export function SearchBarSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <Skeleton className="w-full md:w-[400px] h-12 rounded-xl" />
      <div className="flex gap-3 w-full md:w-auto">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-32 h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 pb-10 animate-pulse">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <SearchBarSkeleton />
      <TableSkeleton rows={5} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-card border border-soft">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="w-32 h-6 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="w-full h-64 rounded-xl" />
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-card border border-soft space-y-2">
          <Skeleton className="w-16 h-3 rounded" />
          <Skeleton className="w-24 h-7 rounded" />
        </div>
      ))}
    </div>
  );
}

export default DashboardPageSkeleton;
