import {
  ChartSkeleton,
  ListSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from '@/components/ui/PageSkeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <PageHeaderSkeleton />

      {/* Stats Grid */}
      <StatCardsSkeleton count={4} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={280} />
        <ListSkeleton items={4} />
      </div>
    </div>
  );
}
