'use client';

import DashboardError from '@/components/ui/DashboardError';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DashboardError
      error={error}
      reset={reset}
      title="Settings Error"
    />
  );
}
