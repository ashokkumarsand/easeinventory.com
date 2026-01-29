import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || (!user.isInternalStaff && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-screen p-6 bg-content1/50">
          <div className="mb-10">
            <h1 className="text-xl font-bold tracking-tight">
              BackOffice<span className="text-primary italic">.EI</span>
            </h1>
          </div>
          
          <nav className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4 mb-2 block">Client Management</label>
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.TENANTS) && (
                <Link 
                  href="/admin/tenants" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  All Clients
                </Link>
              )}
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.LICENSES) && (
                <Link 
                  href="/admin/licenses" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  License Registry
                </Link>
              )}
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.INVENTORY_REQUESTS) && (
                <Link 
                  href="/admin/inventory-requests" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  Inventory Requests
                </Link>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4 mb-2 block">Operations</label>
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.REFUNDS) && (
                <Link 
                  href="/admin/refunds" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  Refund Requests
                </Link>
              )}
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.PROMOTIONS) && (
                <Link 
                  href="/admin/promotions" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  Promotional Offers
                </Link>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4 mb-2 block">System</label>
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.APPROVALS) && (
                <Link 
                  href="/admin/backoffice" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  Pending Approvals
                </Link>
              )}
              {(user.backofficePermissions?.ALL || user.backofficePermissions?.STAFF) && (
                <Link 
                  href="/admin/staff" 
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground font-medium"
                >
                  Staff Management
                </Link>
              )}
            </div>
            
            <div className="pt-10">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground/40 hover:text-foreground text-sm font-bold"
              >
                Return to Dashboard
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
