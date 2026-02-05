'use client';

import BarcodeScanner from '@/components/ui/BarcodeScanner';
import { ThermalReceipt } from '@/components/ui/ThermalReceipt';
import { generateUPILink } from '@/lib/payments/upi';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CheckCircle2,
    Download,
    FileText,
    Loader2,
    Plus,
    Printer,
    QrCode,
    Receipt,
    ScanLine,
    Send,
    Trash2,
    TrendingUp,
    Truck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

// Role color mapping for UI
const getStatusColor = (status: string | undefined | null): "default" | "secondary" | "destructive" | "outline" => {
  switch(status?.toLowerCase()) {
    case 'paid': return 'default';
    case 'partial': return 'secondary';
    case 'unpaid': return 'destructive';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
};

export default function InvoicesPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const paymentModal = useDisclosure();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<any>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<any>(null);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const thermalRef = useRef<HTMLDivElement>(null);

  // HSN Search State
  const [hsnResults, setHsnResults] = useState<any[]>([]);
  const [isHsnLoading, setIsHsnLoading] = useState(false);
  const [activeHsnIndex, setActiveHsnIndex] = useState<number | null>(null);

  const handleHsnSearch = async (query: string, index: number) => {
    if (query.length < 2) {
      setHsnResults([]);
      setActiveHsnIndex(null);
      return;
    }
    setIsHsnLoading(true);
    setActiveHsnIndex(index);
    try {
      const res = await fetch(`/api/compliance/hsn?q=${query}`);
      const data = await res.json();
      setHsnResults(data.results || []);
    } catch (error) {
      console.error('HSN search error:', error);
    } finally {
      setIsHsnLoading(false);
    }
  };

  const handlePrintThermal = (invoice: any) => {
    setSelectedInvoiceForPrint(invoice);
    // Give state time to update and component to render
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // New Invoice State
  const [items, setItems] = useState([{ id: 1, desc: '', hsn: '', qty: 1, price: 0 }]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanningForIndex, setScanningForIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchTenantInfo();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Fetch invoices error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenantInfo = async () => {
    try {
      const response = await fetch('/api/settings/tenant');
      const data = await response.json();
      setTenantInfo(data.tenant);
    } catch (error) {
      console.error('Fetch tenant info error:', error);
    }
  };

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          items: items.map(it => ({
             description: it.desc,
             hsnCode: it.hsn,
             quantity: it.qty,
             unitPrice: it.price
          })),
          invoiceDate: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchInvoices();
        onOpenChange(false);
        setItems([{ id: 1, desc: '', hsn: '', qty: 1, price: 0 }]);
        setCustomerInfo({ name: '', phone: '' });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to generate invoice');
      }
    } catch (error) {
      alert('Error creating invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', hsn: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(it => it.id !== id));
  };

  const handleScanSuccess = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?search=${barcode}&limit=1`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const next = [...items];

        // If we are scanning for a specific row index
        if (scanningForIndex !== null) {
          next[scanningForIndex] = {
            ...next[scanningForIndex],
            desc: product.name,
            hsn: product.hsnCode || '',
            price: Number(product.salePrice) || 0
          };
        } else {
          // Otherwise append a new row
          next.push({
            id: Date.now(),
            desc: product.name,
            hsn: product.hsnCode || '',
            qty: 1,
            price: Number(product.salePrice) || 0
          });
        }
        setItems(next);
      } else {
        alert(`No product found with barcode: ${barcode}`);
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
    } finally {
      setScanningForIndex(null);
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, it) => acc + (it.qty * it.price), 0);
  };

  const exportToGSTR1 = async () => {
    try {
      // For demo/prototype, we'll use a fixed range. In prod, this would be from a date picker.
      const start = '2024-01-01';
      const end = '2024-12-31';

      const response = await fetch(`/api/invoices/export/gstr1?startDate=${start}&endDate=${end}`);
      if (!response.ok) throw new Error('Export failed');

      const result = await response.json();

      if (result.count === 0) return alert('No invoices found for this period');

      const headers = Object.keys(result.data[0]);
      const csvContent = [
        headers.join(','),
        ...result.data.map((row: any) => headers.map(h => row[h]).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `GSTR1_Export_${start}_to_${end}.csv`);
      link.click();
    } catch (error) {
      alert('Error exporting GSTR-1 data');
    }
  };

  const selectHsnCode = (hsn: any, idx: number) => {
    const next = [...items];
    next[idx].hsn = hsn.code;
    // If description is empty, auto-fill it
    if (!next[idx].desc) next[idx].desc = hsn.description;
    setItems(next);
    setHsnResults([]);
    setActiveHsnIndex(null);
  };

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                <FileText size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-yellow-600">Financial Terminal</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">GST compliant invoicing and enterprise payment tracking.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="font-bold rounded-2xl" onClick={exportToGSTR1}>
               <Download size={18} className="mr-2" />
               GSTR-1 Export
            </Button>
           <Button onClick={onOpen} className="font-black px-8 shadow-xl shadow-yellow-500/20 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white">
              <Plus size={20} className="mr-2" />
              Create Bill
           </Button>
        </div>
      </div>

      {/* Summary View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-zinc-900 dark:bg-zinc-950 text-white p-6 border border-zinc-800 rounded-lg">
            <CardContent className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Net Receivables</p>
               <h3 className="text-3xl font-black mb-4">Rs.12,48,000</h3>
               <div className="flex items-center gap-2 text-green-500 font-bold text-xs">
                  <TrendingUp size={14} /> +14% vs last month
               </div>
            </CardContent>
         </Card>
         <Card className="bg-card border border-border p-6 rounded-lg">
            <CardContent className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Pending Payments</p>
               <h3 className="text-3xl font-black mb-4 text-destructive">Rs.2,84,200</h3>
               <p className="text-xs font-bold text-muted-foreground">12 Overdue Invoices</p>
            </CardContent>
         </Card>
         <Card className="bg-card border border-border p-6 rounded-lg">
            <CardContent className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Collected Today</p>
               <h3 className="text-3xl font-black text-green-500">Rs.84,500</h3>
               <p className="text-xs font-bold text-muted-foreground">8 Transactions processed</p>
            </CardContent>
         </Card>
      </div>

      {/* Invoice Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">INVOICE #</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">RECIPIENT</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">DATE</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">AMOUNT</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">STATUS</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-left">DOC TYPE</th>
              <th className="bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted-foreground px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-none hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="py-5 px-6">
                   <span className="font-black text-black/40 dark:text-white/40">{inv.invoiceNumber}</span>
                </td>
                <td className="py-5 px-6">
                   <div className="flex flex-col">
                      <span className="font-black tracking-tight">{inv.customer?.name || 'Walk-in Customer'}</span>
                      <span className="text-[10px] opacity-30 font-bold uppercase">Customer ID: C-{inv.customer?.id?.slice(-4).toUpperCase() || 'N/A'}</span>
                   </div>
                </td>
                <td className="py-5 px-6 text-xs font-black opacity-50 uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td className="py-5 px-6">
                   <span className="font-black text-lg">{Number(inv.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                </td>
                <td className="py-5 px-6">
                   <Badge
                     variant={getStatusColor(inv.paymentStatus)}
                     className="font-black text-[10px] uppercase"
                   >
                     {inv.paymentStatus}
                   </Badge>
                </td>
                <td className="py-5 px-6">
                   <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{inv.status} Invoice</span>
                </td>
                <td className="py-5 px-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handlePrintThermal(inv)}>
                            <Receipt size={16} className="text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full" onClick={async () => {
                              const res = await fetch('/api/compliance/gst', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'E_INVOICE', targetId: inv.id })
                              });
                              if (res.ok) fetchInvoices();
                          }}>
                            <CheckCircle2 size={16} className={inv.gstStatus === 'GENERATED' ? "text-green-500" : "opacity-40"} />
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                              setSelectedPaymentInvoice(inv);
                              paymentModal.onOpen();
                          }}>
                            <QrCode size={16} className="text-green-500" />
                          </Button>
                          {Number(inv.total) > 50000 && (
                              <Button variant="ghost" size="icon" className="rounded-full" onClick={async () => {
                                  alert('Generating e-Way Bill for Invoice...');
                                  // In a real app, this would use the same GST API with action: 'E_WAY_BILL'
                              }}>
                                <Truck size={16} className="opacity-40" />
                              </Button>
                          )}
                      </div>
                      {inv.irn && (
                          <div className="flex flex-col text-center">
                              <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">IRN Generated</span>
                              <span className="text-[7px] font-bold opacity-30 truncate w-24 leading-none mx-auto">{inv.irn}</span>
                          </div>
                      )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hidden">
           <ThermalReceipt ref={thermalRef} invoice={selectedInvoiceForPrint} tenant={tenantInfo} />
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => {
            setIsScannerOpen(false);
            setScanningForIndex(null);
        }}
        onScanSuccess={handleScanSuccess}
      />

      {/* UPI Payment Modal */}
      <Dialog open={paymentModal.isOpen} onOpenChange={paymentModal.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect UPI Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {selectedPaymentInvoice && tenantInfo?.upiId ? (
              <div className="space-y-6 flex flex-col items-center text-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value={generateUPILink({
                      payeeAddress: tenantInfo.upiId,
                      payeeName: tenantInfo.name,
                      amount: Number(selectedPaymentInvoice.total),
                      transactionRef: selectedPaymentInvoice.invoiceNumber,
                      transactionNote: `Payment for Invoice ${selectedPaymentInvoice.invoiceNumber}`
                    })}
                    size={200}
                    level="H"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-black">{Number(selectedPaymentInvoice.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</h4>
                  <p className="text-xs text-muted-foreground">Scan using GPay, PhonePe, or Paytm</p>
                </div>
                <div className="w-full p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Payee VPA</p>
                  <p className="font-bold">{tenantInfo.upiId}</p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-destructive font-bold">UPI ID not configured in Tenant Settings.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => paymentModal.onOpenChange(false)}>Close</Button>
            <Button onClick={() => {
              alert('Payment status check starting...');
              paymentModal.onOpenChange(false);
            }}>Verify Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
             <DialogTitle>Generate Invoice</DialogTitle>
             <DialogDescription>GST Compliance Ready Billing System</DialogDescription>
          </DialogHeader>
          <div className="space-y-8 py-4">

            {/* Header Info */}
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Entity Details</h4>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Type</Label>
                    <Select>
                      <SelectTrigger className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                        <SelectValue placeholder="Consumer / Business" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="b2c">B2C (Retail Consumer)</SelectItem>
                         <SelectItem value="b2b">B2B (Business / GST Registered)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Name</Label>
                    <Input
                      placeholder="e.g. Alex Smith"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Phone</Label>
                    <Input
                      placeholder="+91 00000 00000"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Meta Information</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Invoice Date</Label>
                       <Input type="date" className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" />
                     </div>
                     <div className="space-y-2">
                       <Label>PO Number</Label>
                       <Input placeholder="Optional" className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Line Items */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Line Items</h4>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button
                        size="sm"
                        variant="outline"
                        className="font-black rounded-lg"
                        onClick={() => {
                            setScanningForIndex(null);
                            setIsScannerOpen(true);
                        }}
                     >
                        <ScanLine size={14} className="mr-2" />
                        Quick Scan
                     </Button>
                     <Button size="sm" className="font-black rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white" onClick={addItem}>
                        <Plus size={14} className="mr-2" />
                        Add Position
                     </Button>
                  </div>
               </div>

               <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                       <div className="flex-grow space-y-2">
                          {idx === 0 && <Label>Description</Label>}
                          <Input
                            placeholder="Product or Service Name"
                            value={item.desc}
                            onChange={(e) => {
                                const next = [...items];
                                next[idx].desc = e.target.value;
                                setItems(next);
                            }}
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                          />
                       </div>
                       <div className="w-56 space-y-2 relative">
                          {idx === 0 && <Label>HSN/SAC</Label>}
                          <Input
                            placeholder="Search code..."
                            value={item.hsn}
                            onChange={(e) => {
                                const next = [...items];
                                next[idx].hsn = e.target.value;
                                setItems(next);
                                handleHsnSearch(e.target.value, idx);
                            }}
                            onFocus={() => setActiveHsnIndex(idx)}
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                          />
                          {activeHsnIndex === idx && hsnResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                              {hsnResults.map((hsn) => (
                                <div
                                  key={hsn.code}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer"
                                  onClick={() => selectHsnCode(hsn, idx)}
                                >
                                  <span className="text-sm font-bold">{hsn.code}</span>
                                  <span className="text-[10px] opacity-50 block truncate">{hsn.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                       <div className="w-24 space-y-2">
                          {idx === 0 && <Label>Qty</Label>}
                          <Input
                            type="number"
                            placeholder="1"
                            className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
                            value={item.qty.toString()}
                            onChange={(e) => {
                                const next = [...items];
                                next[idx].qty = parseInt(e.target.value) || 0;
                                setItems(next);
                            }}
                          />
                       </div>
                       <div className="w-40 space-y-2">
                          {idx === 0 && <Label>Unit Price</Label>}
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-30">Rs.</span>
                            <Input
                              placeholder="0.00"
                              className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 pl-10"
                              value={item.price.toString()}
                              onChange={(e) => {
                                  const next = [...items];
                                  next[idx].price = parseFloat(e.target.value) || 0;
                                  setItems(next);
                              }}
                            />
                          </div>
                       </div>
                       <div className="w-40 bg-zinc-100 dark:bg-zinc-800/50 h-12 rounded-xl flex flex-col justify-center px-4">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Subtotal</p>
                          <p className="text-base font-black leading-none">{(item.qty * item.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                       </div>
                       <Button
                           variant="ghost"
                           size="icon"
                           className="shrink-0 h-12 w-12 rounded-full"
                           onClick={() => {
                               setScanningForIndex(idx);
                               setIsScannerOpen(true);
                           }}
                       >
                           <ScanLine size={20} className="text-primary" />
                       </Button>
                       <Button variant="ghost" size="icon" className="shrink-0 h-12 w-12 rounded-full text-destructive" onClick={() => removeItem(item.id)}>
                         <Trash2 size={20} />
                       </Button>
                    </div>
                  ))}
               </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col md:flex-row gap-10">
               <div className="flex-grow space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Terms & Notes</h4>
                  </div>
                  <Textarea placeholder="Terms of payment, delivery instructions, bank details..." className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 min-h-[120px]" />
               </div>
               <div className="w-full md:w-[320px] p-6 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center text-zinc-400">
                     <p className="text-xs font-bold uppercase">Subtotal</p>
                     <p className="text-base font-bold">{calculateTotal().toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 pb-4 border-b border-zinc-700">
                     <p className="text-xs font-bold uppercase">GST (18%)</p>
                     <p className="text-base font-bold">{(calculateTotal() * 0.18).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <p className="text-sm font-bold uppercase text-yellow-500">Grand Total</p>
                     <div className="text-right">
                       <p className="text-2xl font-black">{(calculateTotal() * 1.18).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                       <p className="text-xs text-zinc-500">Round-off Included</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Discard Draft</Button>
            <div className="flex-grow flex justify-end gap-3">
               <Button variant="outline">
                 <Printer size={18} className="mr-2" />
                 Preview
               </Button>
                <Button onClick={handleCreateInvoice} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   <Send size={18} className="mr-2" />
                   Finalize Invoice
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
