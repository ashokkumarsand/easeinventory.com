'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppWidgetProps {
    onSend: (data: {
        phone: string;
        templateName: string;
        referenceType?: string;
        referenceId?: string;
    }) => Promise<void>;
    defaultPhone?: string;
    referenceType?: string;
    referenceId?: string;
    compact?: boolean;
}

const QUICK_TEMPLATES = [
    { key: 'invoice_sent', label: 'Invoice Sent', type: 'utility' },
    { key: 'payment_received', label: 'Payment Received', type: 'utility' },
    { key: 'payment_reminder', label: 'Payment Reminder', type: 'marketing' },
    { key: 'order_confirmation', label: 'Order Confirmation', type: 'utility' },
    { key: 'delivery_update', label: 'Delivery Update', type: 'utility' },
    { key: 'repair_received', label: 'Repair Received', type: 'utility' },
    { key: 'repair_ready', label: 'Repair Ready', type: 'utility' },
];

export default function WhatsAppWidget({
    onSend,
    defaultPhone = '',
    referenceType,
    referenceId,
    compact = false,
}: WhatsAppWidgetProps) {
    const [phone, setPhone] = useState(defaultPhone);
    const [template, setTemplate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSend = async () => {
        if (!phone || !template) {
            setResult({ success: false, message: 'Phone and template are required' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            await onSend({
                phone,
                templateName: template,
                referenceType,
                referenceId,
            });
            setResult({ success: true, message: 'Message sent successfully' });
            setPhone('');
            setTemplate('');
        } catch (err: any) {
            setResult({ success: false, message: err.message || 'Failed to send' });
        } finally {
            setIsLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative">
                    <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <Input
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/5 h-10 rounded-xl pl-9"
                    />
                </div>
                <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="bg-black/5 h-10 min-w-[140px] rounded-xl">
                        <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                        {QUICK_TEMPLATES.map((t) => (
                            <SelectItem key={t.key} value={t.key}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={isLoading}
                    className="rounded-xl bg-green-500 hover:bg-green-600 h-10 w-10"
                >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
            </div>
        );
    }

    return (
        <Card className="modern-card rounded-lg">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <MessageCircle size={20} className="text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm">Quick WhatsApp</h3>
                        <p className="text-[10px] font-bold opacity-40">Send a message template</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                        <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <Input
                            id="phone"
                            placeholder="+91 XXXXX XXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-black/5 dark:bg-white/5 h-12 rounded-xl pl-10"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="template">Message Template</Label>
                    <Select value={template} onValueChange={setTemplate}>
                        <SelectTrigger className="bg-black/5 dark:bg-white/5 h-12 rounded-xl">
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {QUICK_TEMPLATES.map((t) => (
                                <SelectItem key={t.key} value={t.key}>
                                    <div className="flex flex-col">
                                        <span>{t.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {t.type === 'marketing' ? 'Marketing (higher cost)' : 'Utility'}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {result && (
                    <div
                        className={`p-3 rounded-xl ${
                            result.success
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-destructive/10 text-destructive'
                        }`}
                    >
                        <p className="text-xs font-bold">{result.message}</p>
                    </div>
                )}

                <Button
                    className="w-full font-black h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSend}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin mr-2" />
                    ) : (
                        <Send size={18} className="mr-2" />
                    )}
                    Send WhatsApp
                </Button>
            </CardContent>
        </Card>
    );
}
