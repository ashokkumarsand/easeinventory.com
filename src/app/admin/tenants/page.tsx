'use client';

import {
  Button, Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import { Filter, MoreVertical, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from 'react';

export default function AllTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      // Fetch all tenants (status filtering would be better in a real app)
      const res = await fetch('/api/admin/tenants?status=APPROVED'); // Defaulting to approved for this view
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

  const filteredTenants = tenants.filter(t => 
    (t.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (t.slug?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">All Tenants</h2>
          <p className="text-foreground/60">Manage all registered businesses on the platform</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search by name or slug..." 
            startContent={<Search size={18} className="text-foreground/30" />}
            value={search}
            onValueChange={setSearch}
            className="w-72"
          />
          <Button variant="flat" startContent={<Filter size={18} />}>
            Filters
          </Button>
        </div>
      </div>

      <Table aria-label="All tenants">
        <TableHeader>
          <TableColumn>BUSINESS NAME</TableColumn>
          <TableColumn>WORKSPACE</TableColumn>
          <TableColumn>PLAN</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          emptyContent={isLoading ? "Loading..." : "No tenants found."}
          items={filteredTenants}
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-tiny text-foreground/40">{item.phone}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono">{item.slug}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" color="primary" variant="flat" className="font-bold">
                  {item.plan}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip 
                  size="sm" 
                  color={item.isActive ? "success" : "danger"} 
                  variant="dot"
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-success" />
                  <span className="text-xs font-bold uppercase tracking-tighter">Verified</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <MoreVertical size={20} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key="edit">Edit Details</DropdownItem>
                      <DropdownItem key="impersonate">Impersonate Owner</DropdownItem>
                      <DropdownItem key="suspend" className="text-danger" color="danger">
                        Suspend Tenant
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
