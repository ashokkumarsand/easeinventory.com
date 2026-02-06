'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Loader2, RefreshCw, RotateCcw, Truck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NDRShipment {
  id: string;
  awbNumber: string;
  shipmentNumber: string;
  ndrStatus: string;
  ndrReason: string | null;
  ndrAttempts: number;
  ndrActionTaken: string | null;
  order: {
    orderNumber: string;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPincode: string;
  } | null;
}

function getNdrBadgeVariant(status: string): 'destructive' | 'default' | 'outline' | 'secondary' {
  switch (status) {
    case 'ACTION_REQUIRED':
      return 'destructive';
    case 'REATTEMPT_REQUESTED':
      return 'default';
    case 'RTO_REQUESTED':
      return 'outline';
    case 'RESOLVED':
      return 'default';
    default:
      return 'secondary';
  }
}

function getNdrBadgeClassName(status: string): string {
  if (status === 'RESOLVED') {
    return 'bg-green-600 text-white hover:bg-green-700';
  }
  return '';
}

export default function NDRManagementPage() {
  const [shipments, setShipments] = useState<NDRShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchNDRShipments();
  }, []);

  const fetchNDRShipments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/shipments/ndr');
      const data = await res.json();
      setShipments(data.shipments || []);
    } catch (err) {
      console.error('Failed to fetch NDR shipments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNDRAction = async (awb: string, action: 'REATTEMPT' | 'RTO') => {
    if (action === 'RTO') {
      const confirmed = confirm(
        'Are you sure you want to return this shipment to origin? This action cannot be undone.',
      );
      if (!confirmed) return;
    }

    setActionLoading(`${awb}-${action}`);
    try {
      const res = await fetch(`/api/shipments/ndr/${awb}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        await fetchNDRShipments();
      } else {
        const data = await res.json();
        console.error('NDR action failed:', data.message);
      }
    } catch (err) {
      console.error('Failed to perform NDR action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            NDR Management
          </h1>
          <p className="text-foreground/50 mt-1">
            Handle failed delivery attempts
          </p>
        </div>
        <Button variant="outline" onClick={fetchNDRShipments}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Empty State */}
      {shipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No pending NDR cases
            </p>
          </CardContent>
        </Card>
      ) : (
        /* NDR Shipment Cards */
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const hasActionPending =
              shipment.ndrStatus === 'REATTEMPT_REQUESTED' ||
              shipment.ndrStatus === 'RTO_REQUESTED';

            return (
              <Card key={shipment.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        <Link
                          href={`/shipments/${shipment.id}`}
                          className="text-primary hover:underline"
                        >
                          {shipment.awbNumber || shipment.shipmentNumber}
                        </Link>
                      </CardTitle>
                      {shipment.order && (
                        <span className="text-sm text-muted-foreground">
                          Order: {shipment.order.orderNumber}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={getNdrBadgeVariant(shipment.ndrStatus)}
                      className={getNdrBadgeClassName(shipment.ndrStatus)}
                    >
                      {shipment.ndrStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Customer Info */}
                  {shipment.order && (
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{shipment.order.shippingName}</div>
                      <div className="text-muted-foreground">
                        {shipment.order.shippingPhone}
                      </div>
                      <div className="text-muted-foreground">
                        {[
                          shipment.order.shippingAddress,
                          shipment.order.shippingCity,
                          shipment.order.shippingPincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  )}

                  {/* NDR Reason */}
                  {shipment.ndrReason && (
                    <div className="text-sm">
                      <span className="font-medium">NDR Reason: </span>
                      <span className="text-muted-foreground">{shipment.ndrReason}</span>
                    </div>
                  )}

                  {/* NDR Attempts */}
                  <div className="text-sm">
                    <span className="font-medium">Attempts: </span>
                    <span className="text-muted-foreground">{shipment.ndrAttempts ?? 0}</span>
                  </div>

                  {/* Action Buttons */}
                  {!hasActionPending ? (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={actionLoading !== null}
                        onClick={() => handleNDRAction(shipment.awbNumber, 'REATTEMPT')}
                      >
                        {actionLoading === `${shipment.awbNumber}-REATTEMPT` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4 mr-2" />
                        )}
                        Reattempt Delivery
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionLoading !== null}
                        onClick={() => handleNDRAction(shipment.awbNumber, 'RTO')}
                      >
                        {actionLoading === `${shipment.awbNumber}-RTO` ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Return to Origin
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <Badge variant="outline">
                        {shipment.ndrStatus === 'REATTEMPT_REQUESTED'
                          ? 'Reattempt Requested'
                          : 'RTO Requested'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
