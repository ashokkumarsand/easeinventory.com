'use client';

import {
    Button, Card,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip
} from "@heroui/react";
import { Check, Eye, Rocket, Users, X } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-foreground/60">Manage new shop and firm registrations</p>
        </div>
        <Chip variant="flat" color="warning" size="lg">
          {tenants.length} Pending
        </Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="modern-card p-6" radius="lg">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black uppercase tracking-tight">Waitlist Intelligence</h3>
                      <p className="text-xs font-bold opacity-40">Track high-intent leads and manual onboarding</p>
                  </div>
                  <Button as="a" href="/admin/backoffice/waitlist" color="primary" radius="full" size="sm" className="font-black px-6">View List</Button>
              </div>
          </Card>
          <Card className="modern-card p-6" radius="lg">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Rocket size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black uppercase tracking-tight">Active Deployments</h3>
                      <p className="text-xs font-bold opacity-40">Platform stability and usage metrics</p>
                  </div>
                  <Button variant="flat" radius="full" size="sm" className="font-black px-6">Stats</Button>
              </div>
          </Card>
      </div>

      <Table aria-label="Pending tenant registrations">
        <TableHeader>
          <TableColumn>BUSINESS NAME</TableColumn>
          <TableColumn>PORTAL ACCESS</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>REGISTRATION DATE</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          emptyContent={isLoading ? "Loading..." : "No pending registrations found."}
          items={tenants}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-tiny text-foreground/40">{item.users?.[0]?.email || 'No email'}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="px-2 py-1 bg-foreground/5 rounded text-primary text-xs font-bold">
                  {item.slug ? `${item.slug}.easeinventory.com` : `/c/${item.id}`}
                </code>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="dot">
                  {item.businessType}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-center">
                  <Tooltip content="Approve">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      color="success" 
                      variant="light"
                      onPress={() => handleAction(item.id, 'APPROVED')}
                    >
                      <Check size={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Reject" color="danger">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      color="danger" 
                      variant="light"
                      onPress={() => handleAction(item.id, 'REJECTED')}
                    >
                      <X size={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="View Details">
                    <Button isIconOnly size="sm" variant="light">
                      <Eye size={20} />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
