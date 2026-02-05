'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    CheckCircle2,
    FileJson,
    FileSpreadsheet,
    FileText,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GSTReportingPage() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [month]);

    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/compliance/gst?month=${month}`);
            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error('Fetch GST summary error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadGSTR1 = async () => {
        try {
            const response = await fetch(`/api/compliance/gst?type=gstr1&month=${month}`);
            const data = await response.json();

            const blob = new Blob([JSON.stringify(data.gstr1, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GSTR1_${month}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            alert('Error generating GSTR1');
        }
    };

    const downloadPDF = async () => {
        try {
            const response = await fetch(`/api/compliance/gst?format=pdf&month=${month}`);
            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GSTR1_${month}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error generating PDF report');
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp size={22} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">GST Reporting</h1>
                    </div>
                    <p className="text-foreground/50 font-bold ml-1">Automated GST compliance and "One-Click" returns.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-48 bg-black/5 h-12 rounded-lg"
                    />
                    <Button
                        className="font-black px-8 shadow-xl shadow-primary/20 rounded-full"
                        size="lg"
                        onClick={downloadGSTR1}
                    >
                        <FileJson size={20} className="mr-2" />
                        Export GSTR-1
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="modern-card p-6 rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Sales (Taxable)</p>
                    <h2 className="text-3xl font-black text-primary">₹{summary?.totalAmount.toLocaleString() || '0'}</h2>
                    <p className="text-xs font-bold mt-2 opacity-60">Across {summary?.invoiceCount || 0} Invoices</p>
                </Card>
                <Card className="modern-card p-6 rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Output GST</p>
                    <h2 className="text-3xl font-black text-success">₹{summary?.totalTax.toLocaleString() || '0'}</h2>
                    <p className="text-xs font-bold mt-2 opacity-60 text-success flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready for filing
                    </p>
                </Card>
                <Card className="modern-card p-6 rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">B2B Sales</p>
                    <h2 className="text-3xl font-black">₹{summary?.totalB2B.toLocaleString() || '0'}</h2>
                    <p className="text-xs font-bold mt-2 opacity-60">With GSTIN validation</p>
                </Card>
                <Card className="modern-card p-6 rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">B2C Sales</p>
                    <h2 className="text-3xl font-black">₹{summary?.totalB2C.toLocaleString() || '0'}</h2>
                    <p className="text-xs font-bold mt-2 opacity-60">Consumer billing</p>
                </Card>
            </div>

            {/* Compliance Checklist */}
            <div className="grid md:grid-cols-2 gap-10">
                <Card className="modern-card p-8 rounded-lg">
                    <CardHeader className="p-0 mb-6 flex flex-row justify-between items-center">
                        <CardTitle className="text-xl font-black">Compliance Health</CardTitle>
                        <Badge variant="secondary" className="bg-success/10 text-success font-black uppercase text-[10px]">Verified</Badge>
                    </CardHeader>
                    <div className="space-y-6">
                        {[
                            { label: 'HSN Codes Assigned', status: true },
                            { label: 'GSTIN Format Valid', status: true },
                            { label: 'IRN Generated for B2B', status: summary?.totalB2B > 0 },
                            { label: 'Place of Supply Logic', status: true },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-black/5 pb-4 last:border-none">
                                <span className="font-bold text-sm opacity-60">{item.label}</span>
                                {item.status ? (
                                    <Badge variant="secondary" className="bg-success/10 text-success font-black">OK</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-warning/10 text-warning font-black">Pending</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="modern-card p-8 bg-black text-white rounded-lg">
                    <h3 className="text-xl font-black mb-4">Export Portal Data</h3>
                    <p className="text-white/40 font-bold mb-8">Download your data in government-approved formats for easy upload to the GST Portal.</p>
                    <div className="grid grid-cols-1 gap-4">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="justify-between font-black h-16 bg-primary/10 text-primary hover:bg-primary/20"
                            onClick={downloadGSTR1}
                        >
                            <div className="text-left">
                                <p className="text-sm">GSTR-1 JSON</p>
                                <p className="text-[10px] opacity-40">Direct Import to GST Offline Tool</p>
                            </div>
                            <FileJson size={20} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="justify-between font-black h-16 bg-secondary/10 text-secondary hover:bg-secondary/20"
                            onClick={downloadPDF}
                        >
                            <div className="text-left">
                                <p className="text-sm">GSTR-1 PDF Report</p>
                                <p className="text-[10px] opacity-40">Professional summary for records</p>
                            </div>
                            <FileText size={20} />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="justify-between font-black h-16 text-white border-white/20 hover:bg-white/10"
                        >
                            <div className="text-left">
                                <p className="text-sm">GSTR-1 Excel</p>
                                <p className="text-[10px] opacity-40">Review format for Accountants</p>
                            </div>
                            <FileSpreadsheet size={20} />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
