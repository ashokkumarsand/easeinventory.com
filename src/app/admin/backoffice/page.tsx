'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Eye, Rocket, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from 'react';

export default function BackofficePage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Added users state
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/tenants?status=PENDING');
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAction = async (tenantId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId, status }),
      });
      
      if (res.ok) {
        fetchTenants();
      }
    } catch (error) {
      console.error(`Failed to ${status} tenant:`, error);
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-foreground/60">Manage new shop and firm registrations</p>
        </div>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {tenants.length} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="modern-card p-6 rounded-lg">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black uppercase tracking-tight">Waitlist Intelligence</h3>
                      <p className="text-xs font-bold opacity-40">Track high-intent leads and manual onboarding</p>
                  </div>
                  <Button asChild variant="default" size="sm" className="font-black px-6 rounded-full">
                      <Link href="/admin/backoffice/waitlist">View List</Link>
                  </Button>
              </div>
          </Card>
          <Card className="modern-card p-6 rounded-lg">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Rocket size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black uppercase tracking-tight">Active Deployments</h3>
                      <p className="text-xs font-bold opacity-40">Platform stability and usage metrics</p>
                  </div>
                  <Button variant="secondary" size="sm" className="font-black px-6 rounded-full">Stats</Button>
              </div>
          </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BUSINESS NAME</TableHead>
            <TableHead>PORTAL ACCESS</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>REGISTRATION DATE</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {isLoading ? "Loading..." : "No pending registrations found."}
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs text-foreground/40">{item.users?.[0]?.email || 'No email'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="px-2 py-1 bg-foreground/5 rounded text-primary text-xs font-bold">
                    {item.slug ? `${item.slug}.easeinventory.com` : `/c/${item.id}`}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {item.businessType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(item.id, 'APPROVED')}
                        >
                          <Check size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleAction(item.id, 'REJECTED')}
                        >
                          <X size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Eye size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  );
}
