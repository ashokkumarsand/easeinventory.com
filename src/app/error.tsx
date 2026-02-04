'use client';

import { Button } from '@heroui/react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-danger" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-default-500">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-xs text-default-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

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
          <Button
            as={Link}
            href="/"
            variant="flat"
            startContent={<Home className="w-4 h-4" />}
            className="font-semibold"
          >
            Go Home
          </Button>
        </div>

        <p className="text-sm text-default-400">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
