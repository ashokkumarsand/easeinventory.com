'use client';

import BarcodeScanner from '@/components/ui/BarcodeScanner';
import { ThermalReceipt } from '@/components/ui/ThermalReceipt';
import { generateUPILink } from '@/lib/payments/upi';
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
    useDisclosure
} from '@heroui/react';
import {
    CheckCircle2,
    Download,
    FileText,
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
const getStatusColor = (status: string | undefined | null) => {
  switch(status?.toLowerCase()) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'unpaid': return 'danger';
    case 'overdue': return 'danger';
    default: return 'default';
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

  const handleHsnSearch = async (query: string) => {
    if (query.length < 2) {
      setHsnResults([]);
      return;
    }
    setIsHsnLoading(true);
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
        onOpenChange();
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

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <FileText size={22} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-warning">Financial Terminal</h1>
           </div>
           <p className="text-black/40 dark:text-white/40 font-bold ml-1">GST compliant invoicing and enterprise payment tracking.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="flat" color="default" className="font-bold rounded-2xl" onClick={exportToGSTR1} startContent={<Download size={18} />}>
               GSTR-1 Export
            </Button>
           <Button color="warning" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-warning/20 text-white" startContent={<Plus size={20} />} onClick={onOpen}>
              Create Bill
           </Button>
        </div>
      </div>

      {/* Summary View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-zinc-900 dark:bg-zinc-950 text-white p-6 border border-zinc-800" radius="lg">
            <CardBody className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Net Receivables</p>
               <h3 className="text-3xl font-black mb-4">₹12,48,000</h3>
               <div className="flex items-center gap-2 text-success font-bold text-xs">
                  <TrendingUp size={14} /> +14% vs last month
               </div>
            </CardBody>
         </Card>
         <Card className="bg-card border border-soft p-6" radius="lg">
            <CardBody className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Pending Payments</p>
               <h3 className="text-3xl font-black mb-4 text-danger">₹2,84,200</h3>
               <p className="text-xs font-bold text-muted">12 Overdue Invoices</p>
            </CardBody>
         </Card>
         <Card className="bg-card border border-soft p-6" radius="lg">
            <CardBody className="p-0">
               <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Collected Today</p>
               <h3 className="text-3xl font-black text-success">₹84,500</h3>
               <p className="text-xs font-bold text-muted">8 Transactions processed</p>
            </CardBody>
         </Card>
      </div>

      {/* Invoice Table */}
      <Table
        aria-label="Invoice Table"
        classNames={{
            wrapper: "p-0 bg-card border border-soft rounded-2xl overflow-hidden shadow-none",
            th: "bg-transparent h-14 font-semibold uppercase tracking-wider text-xs text-muted px-6",
            td: "py-5 px-6",
            tr: "border-b border-soft last:border-none",
        }}
      >
        <TableHeader>
          <TableColumn>INVOICE #</TableColumn>
          <TableColumn>RECIPIENT</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>DOC TYPE</TableColumn>
          <TableColumn align="center">ACTION</TableColumn>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <TableCell>
                 <span className="font-black text-black/40 dark:text-white/40">{inv.invoiceNumber}</span>
              </TableCell>
              <TableCell>
                 <div className="flex flex-col">
                    <span className="font-black tracking-tight">{inv.customer?.name || 'Walk-in Customer'}</span>
                    <span className="text-[10px] opacity-30 font-bold uppercase">Customer ID: C-{inv.customer?.id?.slice(-4).toUpperCase() || 'N/A'}</span>
                 </div>
              </TableCell>
              <TableCell className="text-xs font-black opacity-50 uppercase">{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
              <TableCell>
                 <span className="font-black text-lg">₹{Number(inv.total).toLocaleString()}</span>
              </TableCell>
              <TableCell>
                 <Chip 
                   variant="flat" 
                   size="sm" 
                   color={getStatusColor(inv.paymentStatus)}
                   className="font-black text-[10px] uppercase"
                 >
                   {inv.paymentStatus}
                 </Chip>
              </TableCell>
              <TableCell>
                 <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{inv.status} Invoice</span>
              </TableCell>
              <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light" radius="full" onClick={() => handlePrintThermal(inv)}><Receipt size={16} className="text-primary" /></Button>
                        <Button isIconOnly size="sm" variant="light" radius="full" color="primary" onClick={async () => {
                            const res = await fetch('/api/compliance/gst', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'E_INVOICE', targetId: inv.id })
                            });
                            if (res.ok) fetchInvoices();
                        }}><CheckCircle2 size={16} className={inv.gstStatus === 'GENERATED' ? "text-success" : "opacity-40"} /></Button>
                        <Button isIconOnly size="sm" variant="light" radius="full" color="success" onClick={() => {
                            setSelectedPaymentInvoice(inv);
                            paymentModal.onOpen();
                        }}><QrCode size={16} className="text-success" /></Button>
                        {Number(inv.total) > 50000 && (
                            <Button isIconOnly size="sm" variant="light" radius="full" color="secondary" onClick={async () => {
                                alert('Generating e-Way Bill for Invoice...');
                                // In a real app, this would use the same GST API with action: 'E_WAY_BILL'
                            }}><Truck size={16} className="opacity-40" /></Button>
                        )}
                    </div>
                    {inv.irn && (
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">IRN Generated</span>
                            <span className="text-[7px] font-bold opacity-30 truncate w-24 leading-none">{inv.irn}</span>
                        </div>
                    )}
                  </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
      <Modal
        isOpen={paymentModal.isOpen}
        onOpenChange={paymentModal.onOpenChange}
        classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl",
            header: "border-b border-zinc-200 dark:border-zinc-800",
            footer: "border-t border-zinc-200 dark:border-zinc-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Collect UPI Payment</h2>
              </ModalHeader>
              <ModalBody className="flex flex-col items-center py-6">
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
                      <h4 className="text-xl font-black">₹{Number(selectedPaymentInvoice.total).toLocaleString()}</h4>
                      <p className="text-xs text-muted">Scan using GPay, PhonePe, or Paytm</p>
                    </div>
                    <div className="w-full p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
                      <p className="text-xs font-bold uppercase text-muted mb-1">Payee VPA</p>
                      <p className="font-bold">{tenantInfo.upiId}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-danger font-bold">UPI ID not configured in Tenant Settings.</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="font-semibold">Close</Button>
                <Button color="primary" className="font-semibold" onPress={() => {
                  alert('Payment status check starting...');
                  onClose();
                }}>Verify Payment</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="4xl"
        classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl",
            header: "border-b border-zinc-200 dark:border-zinc-800",
            body: "py-6",
            footer: "border-t border-zinc-200 dark:border-zinc-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                 <h2 className="text-xl font-bold">Generate Invoice</h2>
                 <p className="text-sm text-muted font-normal">GST Compliance Ready Billing System</p>
              </ModalHeader>
              <ModalBody className="space-y-8">
                
                {/* Header Info */}
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Entity Details</h4>
                      </div>
                      <Select 
                        label="Recipient Type" 
                        placeholder="Consumer / Business" 
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        classNames={{ trigger: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }}
                      >
                         <SelectItem key="b2c">B2C (Retail Consumer)</SelectItem>
                         <SelectItem key="b2b">B2B (Business / GST Registered)</SelectItem>
                      </Select>
                      <Input 
                        label="Billing Name" 
                        placeholder="e.g. Alex Smith" 
                        value={customerInfo.name}
                        onValueChange={(val) => setCustomerInfo({...customerInfo, name: val})}
                        labelPlacement="outside" 
                        size="lg" 
                        radius="lg" 
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                      />
                      <Input 
                        label="Customer Phone" 
                        placeholder="+91 00000 00000" 
                        value={customerInfo.phone}
                        onValueChange={(val) => setCustomerInfo({...customerInfo, phone: val})}
                        labelPlacement="outside" 
                        size="lg" 
                        radius="lg" 
                        classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                      />
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Meta Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <Input label="Invoice Date" type="date" labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} />
                         <Input label="PO Number" placeholder="Optional" labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} />
                      </div>
                   </div>
                </div>

                {/* Line Items */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Line Items</h4>
                      </div>
                      <div className="flex items-center gap-3">
                         <Button 
                            size="sm" 
                            variant="flat" 
                            color="primary" 
                            className="font-black rounded-lg" 
                            startContent={<ScanLine size={14} />} 
                            onClick={() => {
                                setScanningForIndex(null);
                                setIsScannerOpen(true);
                            }}
                         >
                            Quick Scan
                         </Button>
                         <Button size="sm" color="warning" variant="flat" className="font-black rounded-lg" startContent={<Plus size={14} />} onClick={addItem}>
                            Add Position
                         </Button>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      {items.map((item, idx) => (
                        <div key={item.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                           <div className="flex-grow">
                              <Input 
                                label={idx === 0 ? "Description" : ""} 
                                placeholder="Product or Service Name" 
                                value={item.desc}
                                onValueChange={(val) => {
                                    const next = [...items];
                                    next[idx].desc = val;
                                    setItems(next);
                                }}
                                labelPlacement="outside" 
                                size="lg" 
                                radius="lg" 
                                classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                              />
                           </div>
                           <div className="w-56">
                              <Autocomplete 
                                label={idx === 0 ? "HSN/SAC" : ""} 
                                placeholder="Search code..." 
                                labelPlacement="outside"
                                size="lg"
                                radius="lg"
                                allowsCustomValue
                                items={hsnResults}
                                isLoading={isHsnLoading}
                                inputValue={item.hsn}
                                onInputChange={(val) => {
                                    const next = [...items];
                                    next[idx].hsn = val;
                                    setItems(next);
                                    handleHsnSearch(val);
                                }}
                                onSelectionChange={(key) => {
                                    if (key) {
                                        const selected = hsnResults.find(r => r.code === key);
                                        if (selected) {
                                            const next = [...items];
                                            next[idx].hsn = selected.code;
                                            // If description is empty, auto-fill it
                                            if (!next[idx].desc) next[idx].desc = selected.description;
                                            setItems(next);
                                        }
                                    }
                                }}
                                classNames={{ base: "h-14", listboxWrapper: "max-h-[300px]" }}
                                inputProps={{
                                    classNames: {
                                        inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700",
                                    }
                                }}
                              >
                                {(hsn) => (
                                    <AutocompleteItem key={hsn.code} textValue={hsn.code}>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{hsn.code}</span>
                                            <span className="text-[10px] opacity-50 truncate">{hsn.description}</span>
                                        </div>
                                    </AutocompleteItem>
                                )}
                              </Autocomplete>
                           </div>
                           <div className="w-24">
                              <Input 
                                label={idx === 0 ? "Qty" : ""} 
                                type="number" 
                                placeholder="1" 
                                labelPlacement="outside" 
                                size="lg" 
                                radius="lg" 
                                classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                                value={item.qty.toString()}
                                onValueChange={(val) => {
                                    const next = [...items];
                                    next[idx].qty = parseInt(val) || 0;
                                    setItems(next);
                                }}
                              />
                           </div>
                           <div className="w-40">
                              <Input 
                                label={idx === 0 ? "Unit Price" : ""} 
                                placeholder="0.00" 
                                labelPlacement="outside" 
                                size="lg" 
                                radius="lg" 
                                startContent={<span className="text-xs font-black opacity-30">₹</span>}
                                classNames={{ inputWrapper: "h-12 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700" }} 
                                value={item.price.toString()}
                                onValueChange={(val) => {
                                    const next = [...items];
                                    next[idx].price = parseFloat(val) || 0;
                                    setItems(next);
                                }}
                              />
                           </div>
                           <div className="w-40 bg-zinc-100 dark:bg-zinc-800/50 h-12 rounded-xl flex flex-col justify-center px-4">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Subtotal</p>
                              <p className="text-base font-black leading-none">₹{(item.qty * item.price).toLocaleString()}</p>
                           </div>
                           <Button 
                               isIconOnly 
                               variant="light" 
                               size="lg" 
                               radius="full" 
                               className="shrink-0 h-14"
                               onClick={() => {
                                   setScanningForIndex(idx);
                                   setIsScannerOpen(true);
                               }}
                           >
                               <ScanLine size={20} className="text-primary" />
                           </Button>
                           <Button isIconOnly variant="light" size="lg" radius="full" color="danger" onClick={() => removeItem(item.id)} className="shrink-0 h-14"><Trash2 size={20} /></Button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="flex-grow space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Terms & Notes</h4>
                      </div>
                      <Textarea placeholder="Terms of payment, delivery instructions, bank details..." radius="lg" classNames={{ inputWrapper: "bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 min-h-[120px]" }} />
                   </div>
                   <div className="w-full md:w-[320px] p-6 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 space-y-4">
                      <div className="flex justify-between items-center text-zinc-400">
                         <p className="text-xs font-bold uppercase">Subtotal</p>
                         <p className="text-base font-bold">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 pb-4 border-b border-zinc-700">
                         <p className="text-xs font-bold uppercase">GST (18%)</p>
                         <p className="text-base font-bold">₹{(calculateTotal() * 0.18).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <p className="text-sm font-bold uppercase text-warning">Grand Total</p>
                         <div className="text-right">
                           <p className="text-2xl font-black">₹{(calculateTotal() * 1.18).toLocaleString()}</p>
                           <p className="text-xs text-zinc-500">Round-off Included</p>
                         </div>
                      </div>
                   </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="font-semibold" onPress={onClose}>Discard Draft</Button>
                <div className="flex-grow flex justify-end gap-3">
                   <Button variant="flat" className="font-semibold" startContent={<Printer size={18} />}>Preview</Button>
                    <Button color="warning" className="font-semibold text-white" onPress={handleCreateInvoice} isLoading={isLoading} startContent={<Send size={18} />}>
                       Finalize Invoice
                    </Button>
                 </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
