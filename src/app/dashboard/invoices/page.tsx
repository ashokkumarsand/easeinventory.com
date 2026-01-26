'use client';

import {
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
    Download,
    FileText,
    MoreVertical,
    Plus,
    Printer,
    Send,
    Share2,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';

// Mock Data
const INITIAL_INVOICES = [
  { id: 'INV-2024-001', customer: 'Rahul Verma', date: '25 Jan 2024', amount: 124999, status: 'paid', type: 'GST Invoice' },
  { id: 'INV-2024-002', customer: 'Sunita Mehra', date: '25 Jan 2024', amount: 18999, status: 'unpaid', type: 'Repairs' },
  { id: 'INV-2024-003', customer: 'Amit Singh', date: '24 Jan 2024', amount: 8999, status: 'partial', type: 'Retail' },
  { id: 'INV-2024-004', customer: 'Singla Electronics', date: '24 Jan 2024', amount: 450000, status: 'paid', type: 'B2B Wholesale' },
];

export default function InvoicesPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  
  // New Invoice State
  const [items, setItems] = useState([{ id: 1, desc: '', qty: 1, price: 0 }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(it => it.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((acc, it) => acc + (it.qty * it.price), 0);
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
           <Button variant="flat" color="default" className="font-bold rounded-2xl" startContent={<Download size={18} />}>
              Ledger
           </Button>
           <Button color="warning" radius="full" size="lg" className="font-black px-8 shadow-xl shadow-warning/20 text-white" startContent={<Plus size={20} />} onClick={onOpen}>
              Create Bill
           </Button>
        </div>
      </div>

      {/* Summary View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="modern-card bg-black text-white p-6" radius="lg">
            <CardBody className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-white">Net Receivables</p>
               <h3 className="text-4xl font-black mb-6">₹12,48,000</h3>
               <div className="flex items-center gap-2 text-success font-black text-xs">
                  <TrendingUp size={14} /> +14% vs last month
               </div>
            </CardBody>
         </Card>
         <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
            <CardBody className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Pending Payments</p>
               <h3 className="text-4xl font-black mb-6 text-danger">₹2,84,200</h3>
               <p className="text-xs font-bold opacity-40 uppercase tracking-tight">12 Overdue Invoices</p>
            </CardBody>
         </Card>
         <Card className="modern-card p-6 border border-black/5 dark:border-white/10" radius="lg">
            <CardBody className="p-0">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Collected Today</p>
               <h3 className="text-4xl font-black text-success">₹84,500</h3>
               <p className="text-xs font-bold opacity-40 uppercase tracking-tight">8 Transactions processed</p>
            </CardBody>
         </Card>
      </div>

      {/* Invoice Table */}
      <Table 
        aria-label="Invoice Table"
        className="modern-card border-none mt-8"
        classNames={{
            wrapper: "p-0 modern-card bg-white dark:bg-[#111318] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden",
            th: "bg-black/[0.02] dark:bg-white/[0.02] h-16 font-black uppercase tracking-wider text-[10px] opacity-40 px-8 first:pl-10 last:pr-10",
            td: "py-6 px-8 first:pl-10 last:pr-10 font-bold",
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
            <TableRow key={inv.id} className="border-b last:border-none border-black/5 dark:border-white/10 hover:bg-black/[0.01] transition-colors">
              <TableCell>
                 <span className="font-black text-black/40 dark:text-white/40">{inv.id}</span>
              </TableCell>
              <TableCell>
                 <div className="flex flex-col">
                    <span className="font-black tracking-tight">{inv.customer}</span>
                    <span className="text-[10px] opacity-30 font-bold uppercase">Customer ID: C-{Math.floor(Math.random()*1000)}</span>
                 </div>
              </TableCell>
              <TableCell className="text-xs font-black opacity-50 uppercase">{inv.date}</TableCell>
              <TableCell>
                 <span className="font-black text-lg">₹{inv.amount.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                 <Chip 
                   variant="flat" 
                   size="sm" 
                   color={inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warning' : 'danger'}
                   className="font-black text-[10px] uppercase"
                 >
                   {inv.status}
                 </Chip>
              </TableCell>
              <TableCell>
                 <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{inv.type}</span>
              </TableCell>
              <TableCell>
                 <div className="flex gap-2">
                    <Button isIconOnly size="sm" variant="light" radius="full"><Printer size={16} className="opacity-40" /></Button>
                    <Button isIconOnly size="sm" variant="light" radius="full"><Share2 size={16} className="opacity-40" /></Button>
                    <Button isIconOnly size="sm" variant="light" radius="full"><MoreVertical size={16} className="opacity-40" /></Button>
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Invoice Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="4xl"
        radius="lg"
        classNames={{ backdrop: "bg-warning/20 backdrop-blur-md", base: "modern-card p-6" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-black/5 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning/10 text-warning rounded-2xl flex items-center justify-center">
                       <Plus size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tight">Generate Document</h2>
                       <p className="text-xs font-bold opacity-30 uppercase tracking-widest">Compliance Ready Billing System</p>
                    </div>
                 </div>
              </ModalHeader>
              <ModalBody className="py-10 space-y-12">
                
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
                        classNames={{ trigger: "bg-black/5 h-14" }}
                      >
                         <SelectItem key="b2c">B2C (Retail Consumer)</SelectItem>
                         <SelectItem key="b2b">B2B (Business / GST Registered)</SelectItem>
                      </Select>
                      <Input 
                        label="Billing Name" 
                        placeholder="e.g. Rahul Verma" 
                        labelPlacement="outside" 
                        size="lg" 
                        radius="lg" 
                        classNames={{ inputWrapper: "bg-black/5 h-14" }} 
                      />
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-warning rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Meta Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <Input label="Invoice Date" type="date" labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "bg-black/5 h-14" }} />
                         <Input label="PO Number" placeholder="Optional" labelPlacement="outside" size="lg" radius="lg" classNames={{ inputWrapper: "bg-black/5 h-14" }} />
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
                      <Button size="sm" color="warning" variant="flat" className="font-black rounded-lg" startContent={<Plus size={14} />} onClick={addItem}>
                         Add Position
                      </Button>
                   </div>
                   
                   <div className="space-y-4">
                      {items.map((item, idx) => (
                        <div key={item.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-300">
                           <div className="flex-grow">
                              <Input 
                                label={idx === 0 ? "Description" : ""} 
                                placeholder="Product or Service Name" 
                                labelPlacement="outside" 
                                size="lg" 
                                radius="lg" 
                                classNames={{ inputWrapper: "bg-black/5 h-14" }} 
                              />
                           </div>
                           <div className="w-24">
                              <Input 
                                label={idx === 0 ? "Qty" : ""} 
                                type="number" 
                                placeholder="1" 
                                labelPlacement="outside" 
                                size="lg" 
                                radius="lg" 
                                classNames={{ inputWrapper: "bg-black/5 h-14" }} 
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
                                classNames={{ inputWrapper: "bg-black/5 h-14" }} 
                                value={item.price.toString()}
                                onValueChange={(val) => {
                                    const next = [...items];
                                    next[idx].price = parseFloat(val) || 0;
                                    setItems(next);
                                }}
                              />
                           </div>
                           <div className="w-40 bg-black/[0.03] h-14 rounded-[1.25rem] flex flex-col justify-center px-6">
                              <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Subtotal</p>
                              <p className="text-lg font-black leading-none">₹{(item.qty * item.price).toLocaleString()}</p>
                           </div>
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
                      <Textarea placeholder="Terms of payment, delivery instructions, bank details..." radius="lg" classNames={{ inputWrapper: "bg-black/5 min-h-[140px]" }} />
                   </div>
                   <div className="w-full md:w-[320px] p-8 rounded-[2.5rem] bg-black text-white space-y-6">
                      <div className="flex justify-between items-center opacity-40">
                         <p className="text-xs font-bold font-black tracking-widest uppercase">Subtotal</p>
                         <p className="text-lg font-black font-black tracking-tight">₹{calculateTotal().toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center opacity-40 pb-6 border-b border-white/10">
                         <p className="text-xs font-bold font-black tracking-widest uppercase">GST (18%)</p>
                         <p className="text-lg font-black font-black tracking-tight">₹{(calculateTotal() * 0.18).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <p className="text-sm font-black tracking-widest uppercase text-warning">Grand Total</p>
                         <div className="text-right">
                           <p className="text-3xl font-black tracking-tight">₹{(calculateTotal() * 1.18).toLocaleString()}</p>
                           <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">Round-off Included</p>
                         </div>
                      </div>
                   </div>
                </div>

              </ModalBody>
              <ModalFooter className="gap-4 pt-4 border-t border-black/5">
                <Button variant="light" className="font-bold h-14 px-8" onPress={onClose}>Discard Draft</Button>
                <div className="flex-grow flex justify-end gap-3">
                   <Button variant="flat" className="font-black h-14 px-8 rounded-2xl" startContent={<Printer size={20} />}>Preview</Button>
                   <Button color="warning" className="w-[240px] font-black h-14 shadow-xl shadow-warning/20 text-white" radius="full" onPress={onClose} startContent={<Send size={20} />}>
                      Finalize & Transmit
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
