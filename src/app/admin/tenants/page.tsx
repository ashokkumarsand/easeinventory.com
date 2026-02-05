'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="secondary">
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BUSINESS NAME</TableHead>
            <TableHead>WORKSPACE</TableHead>
            <TableHead>PLAN</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {isLoading ? "Loading..." : "No tenants found."}
              </TableCell>
            </TableRow>
          ) : (
            filteredTenants.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono">{item.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="font-bold">
                    {item.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.isActive ? "default" : "destructive"}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Verified</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Impersonate Owner</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Suspend Tenant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
