'use client';

import { Card, CardBody, CardHeader, Skeleton } from '@heroui/react';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-foreground/5">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card className="border border-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </CardHeader>
            <CardBody>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardBody>
          </Card>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="border border-foreground/5">
                <CardHeader>
                  <Skeleton className="h-6 w-32 rounded-lg" />
                </CardHeader>
                <CardBody className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 rounded-lg" />
                        <Skeleton className="h-3 w-20 rounded-lg" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-lg" />
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-foreground/5">
              <CardHeader>
                <Skeleton className="h-6 w-32 rounded-lg" />
              </CardHeader>
              <CardBody className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-3 w-2/3 rounded-lg" />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
