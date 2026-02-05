'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
    AlertCircle,
    Bell,
    CreditCard,
    Filter,
    MessageSquare,
    Search,
    TrendingDown,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CreditManagementPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCreditSummary();
  }, []);

  const fetchCreditSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/finance/credit');
      const data = await res.json();
      setCustomers(data.summary || []);
    } catch (error) {
      console.error('Error fetching credit summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReminders = async () => {
    setIsSendingBulk(true);
    try {
      const res = await fetch('/api/finance/credit/remind', { method: 'POST' });
      const data = await res.json();
      alert(`Bulk Reminders Processed: Sent to ${data.sentCount} out of ${data.totalDebtors} debtors.`);
    } catch (error) {
      alert('Error processing bulk reminders');
    } finally {
      setIsSendingBulk(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const totalOutstanding = customers.reduce((acc, c) => acc + c.outstanding, 0);

  const sendReminder = async (customer: any) => {
    try {
      alert(`Sending WhatsApp reminder to ${customer.name} (${customer.phone}) for ${customer.outstanding.toLocaleString()}`);

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: customer.phone,
          templateName: 'PAYMENT_REMINDER',
          variables: [customer.name, `${customer.outstanding.toLocaleString()}`]
        })
      });

      if (res.ok) {
        alert('Reminder sent successfully');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
                <CreditCard size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-white">Udhaar Ledger</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">Credit management and automated collection tracking.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button
                variant="secondary"
                className="font-black rounded-2xl bg-danger/10 text-danger hover:bg-danger/20"
                onClick={handleBulkReminders}
                disabled={isSendingBulk}
            >
               {isSendingBulk && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               <Bell size={18} className="mr-2" />
               Bulk Reminders
            </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="modern-card bg-danger text-white p-6 rounded-lg">
            <CardContent className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Total Outstanding (Udhaar)</p>
               <h3 className="text-4xl font-black mb-6">{totalOutstanding.toLocaleString()}</h3>
               <div className="flex items-center gap-2 font-black text-xs">
                  <TrendingDown size={14} /> At risk: { (totalOutstanding * 0.15).toLocaleString() }
               </div>
            </CardContent>
         </Card>
         <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
            <CardContent className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Active Debtors</p>
               <h3 className="text-4xl font-black mb-6 text-white">{customers.filter(c => c.outstanding > 0).length}</h3>
               <p className="text-xs font-bold opacity-40 uppercase tracking-tight">Customers with pending dues</p>
            </CardContent>
         </Card>
         <Card className="modern-card p-6 border border-black/5 dark:border-white/10 rounded-lg">
            <CardContent className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Average Aging</p>
               <h3 className="text-4xl font-black text-white">18 Days</h3>
               <p className="text-xs font-bold opacity-40 uppercase tracking-tight mt-6">Payment cycle health</p>
            </CardContent>
         </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
            <Input
              placeholder="Search by name or phone..."
              className="w-full bg-black/[0.03] dark:bg-white/[0.03] h-14 pl-10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" className="font-bold text-white border-white/10">
              <Filter size={18} className="mr-2" />
              All Dues
            </Button>
          </div>
      </div>

      {/* Credit Table */}
      <div className="modern-card theme-table-wrapper border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-none">
        <table className="w-full">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 pl-10 text-left">CUSTOMER</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">TOTAL BILLED</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">TOTAL PAID</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">OUTSTANDING</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">LAST TRANSACTION</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 text-left">STATUS</th>
              <th className="h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 pr-10 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 opacity-30">No customers with transaction history found.</td>
              </tr>
            ) : (
              filteredCustomers.map((c: any) => (
                <tr key={c.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
                  <td className="py-6 px-8 pl-10 font-bold text-white/70">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/20 dark:text-white/20">
                            <User size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-tight text-white">{c.name}</span>
                            <span className="text-[10px] opacity-30 font-bold uppercase">{c.phone}</span>
                        </div>
                     </div>
                  </td>
                  <td className="py-6 px-8 font-bold text-white/70">{c.totalInvoiced.toLocaleString()}</td>
                  <td className="py-6 px-8 font-bold text-success">{c.totalPaid.toLocaleString()}</td>
                  <td className="py-6 px-8 font-bold text-white/70">
                     <span className={`text-lg font-black ${c.outstanding > 0 ? 'text-danger' : 'text-success'}`}>
                        {c.outstanding.toLocaleString()}
                     </span>
                  </td>
                  <td className="py-6 px-8 font-bold text-white/70 text-xs font-black opacity-40 uppercase">
                    {c.lastTransaction ? new Date(c.lastTransaction).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-6 px-8 font-bold text-white/70">
                     {c.outstanding > 0 ? (
                        <Badge variant="secondary" className="font-black text-[9px] uppercase bg-danger/10 text-danger">Payment Due</Badge>
                     ) : (
                        <Badge variant="secondary" className="font-black text-[9px] uppercase bg-success/10 text-success">Settled</Badge>
                     )}
                  </td>
                  <td className="py-6 px-8 pr-10 font-bold text-white/70">
                     <div className="flex gap-2 justify-center">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                            onClick={() => sendReminder(c)}
                            disabled={c.outstanding <= 0}
                        >
                            <MessageSquare size={16} />
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-lg">
                            <AlertCircle size={16} />
                        </Button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
