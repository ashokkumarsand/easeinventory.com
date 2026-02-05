'use client';

import React from 'react';

/**
 * Premium Skeleton Base Component with shimmer effect
 */
function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bg-foreground/[0.06] skeleton-shimmer ${className}`}
      style={style}
    />
  );
}

/**
 * Reusable skeleton components for loading states
 * Premium shimmer effect - no boring pulse animations
 */

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 space-y-3">
      <Skeleton className="w-24 h-3 rounded-lg" />
      <Skeleton className="w-32 h-8 rounded-lg" />
      <Skeleton className="w-20 h-4 rounded-lg" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 space-y-3">
      <Skeleton className="w-20 h-2.5 rounded-md" />
      <div className="flex items-end gap-3">
        <Skeleton className="w-28 h-8 rounded-lg" />
        <Skeleton className="w-16 h-4 rounded-md" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-foreground/5 bg-foreground/[0.01]">
      {/* Header */}
      <div className="p-4 border-b border-foreground/5 bg-foreground/[0.02] flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 rounded-md flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-foreground/5 flex gap-4 items-center">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4 rounded-md" />
            <Skeleton className="w-1/2 h-3 rounded-md" />
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
        <Skeleton className="w-72 h-4 rounded-md ml-1" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-24 h-10 rounded-2xl" />
        <Skeleton className="w-36 h-12 rounded-full" />
      </div>
    </div>
  );
}

export function SearchBarSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <Skeleton className="w-full md:w-[400px] h-12 rounded-xl" />
      <div className="flex gap-3 w-full md:w-auto">
        <Skeleton className="w-24 h-10 rounded-full" />
        <Skeleton className="w-12 h-10 rounded-2xl" />
        <Skeleton className="w-28 h-10 rounded-2xl" />
      </div>
    </div>
  );
}

export function QuickAddSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-48 h-3 rounded-md ml-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 items-end">
        <div className="col-span-2 space-y-1.5">
          <Skeleton className="w-24 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-16 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-14 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-10 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-12 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-14 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <SearchBarSkeleton />
      <TableSkeleton rows={5} />
    </div>
  );
}

export function InventoryPageSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <div className="p-6 rounded-2xl bg-primary/10 space-y-3">
          <Skeleton className="w-24 h-2.5 rounded-md" />
          <div className="flex items-end gap-3">
            <Skeleton className="w-16 h-8 rounded-lg" />
            <Skeleton className="w-28 h-4 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SearchBarSkeleton />
        <QuickAddSkeleton />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}

export function ChartSkeleton({ height = 256 }: { height?: number }) {
  return (
    <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="w-36 h-5 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>
      </div>
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-foreground/5">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-2/3 h-4 rounded-md" />
        <Skeleton className="w-1/3 h-3 rounded-md" />
      </div>
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="rounded-2xl border border-foreground/5 overflow-hidden">
      <div className="p-4 border-b border-foreground/5 bg-foreground/[0.02]">
        <Skeleton className="w-32 h-5 rounded-md" />
      </div>
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-24 h-3.5 rounded-md" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="w-28 h-12 rounded-xl" />
        <Skeleton className="w-24 h-12 rounded-xl" />
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="w-48 h-7 rounded-lg" />
        <Skeleton className="w-72 h-4 rounded-md" />
      </div>
      <FormSkeleton fields={3} />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
      <Skeleton className="w-full h-40 rounded-xl mb-4" />
      <Skeleton className="w-3/4 h-5 rounded-md mb-2" />
      <Skeleton className="w-1/2 h-3.5 rounded-md mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-20 h-6 rounded-lg" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard Analytics Skeleton
export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <PageHeaderSkeleton />

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>

      {/* Table + List Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} />
        </div>
        <ListSkeleton items={5} />
      </div>
    </div>
  );
}

export default DashboardPageSkeleton;
