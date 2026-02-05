'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  formats: ('pdf' | 'csv' | 'xlsx')[];
  icon: React.ReactNode;
}

const reportTypes: ReportType[] = [
  {
    id: 'inventory',
    name: 'Inventory Report',
    description: 'Complete stock levels and valuation',
    formats: ['pdf', 'csv', 'xlsx'],
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Revenue, orders, and customer data',
    formats: ['pdf', 'csv', 'xlsx'],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'gst',
    name: 'GST Summary',
    description: 'Tax liability and input credit',
    formats: ['pdf', 'xlsx'],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'purchase',
    name: 'Purchase Report',
    description: 'Supplier orders and payments',
    formats: ['pdf', 'csv', 'xlsx'],
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
];

const formatIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-destructive" />,
  csv: <FileSpreadsheet className="w-4 h-4 text-green-500" />,
  xlsx: <FileSpreadsheet className="w-4 h-4 text-primary" />,
};

interface ExportReportsProps {
  isLoading?: boolean;
}

export function ExportReports({ isLoading }: ExportReportsProps) {
  const [selectedReport, setSelectedReport] = useState<string>('inventory');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const currentReport = reportTypes.find((r) => r.id === selectedReport);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // In production, this would trigger actual report generation/download
    setIsExporting(false);
  };

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Export Reports</h3>
            <p className="text-sm text-foreground/50">Download detailed business reports</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Report Type</label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="bg-foreground/5 border-0 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  <div className="flex items-center gap-2">
                    {report.icon}
                    <span>{report.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Date Range</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-foreground/5 border-0"
              placeholder="Start date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-foreground/5 border-0"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Format</label>
          <div className="flex gap-2">
            {currentReport?.formats.map((format) => (
              <Button
                key={format}
                variant={selectedFormat === format ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setSelectedFormat(format)}
              >
                {formatIcons[format]}
                <span className="ml-2">{format.toUpperCase()}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button
          className="w-full font-bold"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </>
          )}
        </Button>

        <p className="text-xs text-foreground/40 text-center">
          Reports are generated in real-time and may take a few seconds
        </p>
      </CardContent>
    </Card>
  );
}
