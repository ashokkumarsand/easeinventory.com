'use client';

import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Spinner,
} from '@heroui/react';
import { MessageCircle, Send } from 'lucide-react';
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
                <Input
                    placeholder="Phone number"
                    value={phone}
                    onValueChange={setPhone}
                    classNames={{ inputWrapper: 'bg-black/5 h-10 rounded-xl' }}
                    size="sm"
                    startContent={<MessageCircle size={14} className="opacity-30" />}
                />
                <Select
                    placeholder="Template"
                    selectedKeys={template ? [template] : []}
                    onSelectionChange={(keys) => setTemplate(Array.from(keys)[0] as string)}
                    classNames={{ trigger: 'bg-black/5 h-10 min-w-[140px] rounded-xl' }}
                    size="sm"
                >
                    {QUICK_TEMPLATES.map((t) => (
                        <SelectItem key={t.key}>{t.label}</SelectItem>
                    ))}
                </Select>
                <Button
                    color="success"
                    size="sm"
                    isIconOnly
                    onClick={handleSend}
                    isLoading={isLoading}
                    className="rounded-xl"
                >
                    <Send size={14} />
                </Button>
            </div>
        );
    }

    return (
        <Card className="modern-card p-6" radius="lg">
            <CardBody className="p-0 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
                        <MessageCircle size={20} className="text-success" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm">Quick WhatsApp</h3>
                        <p className="text-[10px] font-bold opacity-40">Send a message template</p>
                    </div>
                </div>

                <Input
                    label="Phone Number"
                    placeholder="+91 XXXXX XXXXX"
                    labelPlacement="outside"
                    value={phone}
                    onValueChange={setPhone}
                    classNames={{ inputWrapper: 'bg-black/5 h-12 rounded-xl' }}
                    startContent={<MessageCircle size={16} className="opacity-30" />}
                />

                <Select
                    label="Message Template"
                    placeholder="Select a template"
                    labelPlacement="outside"
                    selectedKeys={template ? [template] : []}
                    onSelectionChange={(keys) => setTemplate(Array.from(keys)[0] as string)}
                    classNames={{ trigger: 'bg-black/5 h-12 rounded-xl' }}
                >
                    {QUICK_TEMPLATES.map((t) => (
                        <SelectItem
                            key={t.key}
                            description={t.type === 'marketing' ? 'Marketing (higher cost)' : 'Utility'}
                        >
                            {t.label}
                        </SelectItem>
                    ))}
                </Select>

                {result && (
                    <div
                        className={`p-3 rounded-xl ${
                            result.success
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                        }`}
                    >
                        <p className="text-xs font-bold">{result.message}</p>
                    </div>
                )}

                <Button
                    color="success"
                    className="w-full font-black h-12"
                    radius="full"
                    onClick={handleSend}
                    isLoading={isLoading}
                    startContent={!isLoading && <Send size={18} />}
                >
                    Send WhatsApp
                </Button>
            </CardBody>
        </Card>
    );
}
