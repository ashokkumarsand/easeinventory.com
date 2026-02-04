'use client';

import { Button } from '@heroui/react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  showHomeButton?: boolean;
}

export default function DashboardError({
  error,
  reset,
  title = 'Something went wrong',
  showHomeButton = true,
}: DashboardErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-default-500">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-xs text-default-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            color="primary"
            variant="solid"
            startContent={<RefreshCw className="w-4 h-4" />}
            onClick={reset}
            className="font-semibold"
          >
            Try Again
          </Button>
          {showHomeButton && (
            <Button
              as={Link}
              href="/dashboard"
              variant="flat"
              startContent={<Home className="w-4 h-4" />}
              className="font-semibold"
            >
              Back to Dashboard
            </Button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-sm text-default-400">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
