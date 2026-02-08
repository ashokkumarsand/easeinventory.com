'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  ClipboardList,
  Clock,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Trash2,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================================
// Types & Constants
// ============================================================

type ReportType =
  | 'INVENTORY_SUMMARY'
  | 'SALES_REPORT'
  | 'SUPPLIER_REPORT'
  | 'CUSTOMER_REPORT'
  | 'FINANCIAL_REPORT'
  | 'STOCK_MOVEMENT';

type ReportFormat = 'CSV' | 'EXCEL';
type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface SavedReport {
  id: string;
  name: string;
  reportType: ReportType;
  filtersJson: Record<string, unknown> | null;
  columnsJson: string[] | null;
  format: ReportFormat;
  scheduleFreq: ScheduleFrequency | null;
  scheduledEmails: string[];
  nextRunAt: string | null;
  lastGeneratedAt: string | null;
  createdAt: string;
}

const REPORT_TYPE_CONFIG: Record<
  ReportType,
  { label: string; description: string; icon: React.ElementType }
> = {
  INVENTORY_SUMMARY: {
    label: 'Inventory Summary',
    description: 'Stock levels, values, and categories',
    icon: Package,
  },
  SALES_REPORT: {
    label: 'Sales Report',
    description: 'Orders, revenue, and payment status',
    icon: TrendingUp,
  },
  SUPPLIER_REPORT: {
    label: 'Supplier Report',
    description: 'Supplier PO counts and values',
    icon: Truck,
  },
  CUSTOMER_REPORT: {
    label: 'Customer Report',
    description: 'Customer segments, CLV, orders',
    icon: Users,
  },
  FINANCIAL_REPORT: {
    label: 'Financial Report',
    description: 'Invoices, revenue, taxes',
    icon: FileText,
  },
  STOCK_MOVEMENT: {
    label: 'Stock Movement',
    description: 'Movement history and audit trail',
    icon: ClipboardList,
  },
};

const REPORT_COLUMNS: Record<ReportType, { key: string; label: string }[]> = {
  INVENTORY_SUMMARY: [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'costPrice', label: 'Cost Price' },
    { key: 'salePrice', label: 'Sale Price' },
    { key: 'totalValue', label: 'Total Value' },
    { key: 'reorderPoint', label: 'Reorder Point' },
    { key: 'abcClass', label: 'ABC Class' },
  ],
  SALES_REPORT: [
    { key: 'orderNumber', label: 'Order Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'date', label: 'Date' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'tax', label: 'Tax' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'paymentStatus', label: 'Payment Status' },
  ],
  SUPPLIER_REPORT: [
    { key: 'name', label: 'Supplier Name' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'poCount', label: 'PO Count' },
    { key: 'totalPOValue', label: 'Total PO Value' },
    { key: 'avgLeadTime', label: 'Avg Lead Time (days)' },
  ],
  CUSTOMER_REPORT: [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'segment', label: 'Segment' },
    { key: 'tier', label: 'Tier' },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'lifetimeValue', label: 'Lifetime Value' },
    { key: 'lastOrderDate', label: 'Last Order Date' },
  ],
  FINANCIAL_REPORT: [
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'date', label: 'Date' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'taxAmount', label: 'Tax Amount' },
    { key: 'total', label: 'Total' },
    { key: 'paymentStatus', label: 'Payment Status' },
  ],
  STOCK_MOVEMENT: [
    { key: 'date', label: 'Date' },
    { key: 'productName', label: 'Product Name' },
    { key: 'type', label: 'Movement Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'notes', label: 'Notes' },
    { key: 'userName', label: 'User' },
  ],
};

// ============================================================
// Component
// ============================================================

export default function ReportBuilderPage() {
  // --- State: Create Report ---
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [format, setFormat] = useState<ReportFormat>('CSV');
  const [reportName, setReportName] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- State: Saved Reports ---
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // --- State: Schedule Dialog ---
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleReportId, setScheduleReportId] = useState<string | null>(null);
  const [scheduleFreq, setScheduleFreq] = useState<ScheduleFrequency | ''>('');
  const [scheduleEmails, setScheduleEmails] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // ---- Effects ----

  useEffect(() => {
    fetchSavedReports();
  }, []);

  useEffect(() => {
    if (selectedType) {
      // Select all columns by default when choosing a type
      setSelectedColumns(REPORT_COLUMNS[selectedType].map((c) => c.key));
    }
  }, [selectedType]);

  // ---- Fetchers ----

  const fetchSavedReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setSavedReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // ---- Actions ----

  const buildFiltersJson = (): Record<string, unknown> => {
    const filters: Record<string, unknown> = {};
    if (filterDateFrom) filters.dateFrom = filterDateFrom;
    if (filterDateTo) filters.dateTo = filterDateTo;
    if (filterStatus) filters.status = filterStatus;
    if (filterCategory) filters.category = filterCategory;
    return filters;
  };

  const handleSaveReport = async () => {
    if (!selectedType || !reportName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportName.trim(),
          reportType: selectedType,
          filtersJson: buildFiltersJson(),
          columnsJson: selectedColumns,
          format,
        }),
      });
      if (res.ok) {
        setReportName('');
        await fetchSavedReports();
      }
    } catch (err) {
      console.error('Failed to save report:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAndDownload = async () => {
    if (!selectedType) return;
    setIsGenerating(true);
    try {
      // First save a temp report, then generate it
      const saveRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Quick ${REPORT_TYPE_CONFIG[selectedType].label} - ${new Date().toLocaleDateString()}`,
          reportType: selectedType,
          filtersJson: buildFiltersJson(),
          columnsJson: selectedColumns,
          format,
        }),
      });
      if (!saveRes.ok) throw new Error('Failed to create report');
      const saved = await saveRes.json();

      // Download the generated file
      const genRes = await fetch(`/api/reports/${saved.id}/generate`);
      if (!genRes.ok) throw new Error('Failed to generate report');

      const blob = await genRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'EXCEL' ? 'xls' : 'csv';
      a.download = `report_${selectedType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      await fetchSavedReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSaved = async (report: SavedReport) => {
    try {
      const res = await fetch(`/api/reports/${report.id}/generate`);
      if (!res.ok) throw new Error('Failed to generate');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = report.format === 'EXCEL' ? 'xls' : 'csv';
      a.download = `${report.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      await fetchSavedReports();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      await fetchSavedReports();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openScheduleDialog = (report: SavedReport) => {
    setScheduleReportId(report.id);
    setScheduleFreq(report.scheduleFreq ?? '');
    setScheduleEmails(report.scheduledEmails.join(', '));
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleReportId) return;
    setIsSavingSchedule(true);
    try {
      const emails = scheduleEmails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

      await fetch(`/api/reports/${scheduleReportId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleFreq: scheduleFreq || null,
          scheduledEmails: emails,
        }),
      });

      setScheduleDialogOpen(false);
      await fetchSavedReports();
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  };

  // ---- Helpers ----

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusFilters = (): string[] => {
    if (!selectedType) return [];
    switch (selectedType) {
      case 'SALES_REPORT':
        return ['DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      case 'FINANCIAL_REPORT':
        return ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'REFUNDED'];
      case 'STOCK_MOVEMENT':
        return ['PURCHASE', 'SALE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT', 'TRANSFER', 'DAMAGE'];
      case 'CUSTOMER_REPORT':
        return ['VIP', 'REGULAR', 'NEW', 'AT_RISK', 'CHURNED'];
      default:
        return [];
    }
  };

  const getStatusFilterLabel = (): string => {
    if (!selectedType) return 'Status';
    switch (selectedType) {
      case 'CUSTOMER_REPORT':
        return 'Segment';
      case 'STOCK_MOVEMENT':
        return 'Movement Type';
      default:
        return 'Status';
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileBarChart className="w-8 h-8" />
            Report Builder
          </h1>
          <p className="text-foreground/50 mt-1">
            Create, download, and schedule custom reports
          </p>
        </div>
        <Button variant="outline" onClick={fetchSavedReports}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ==================== CREATE REPORT ==================== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create Report</h2>

        {/* Report Type Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(REPORT_TYPE_CONFIG) as ReportType[]).map((type) => {
            const config = REPORT_TYPE_CONFIG[type];
            const Icon = config.icon;
            const isSelected = selectedType === type;

            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:bg-muted/50 ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedType(type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground/60'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {config.label}
                      </CardTitle>
                      <p className="text-xs text-foreground/50">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Configuration Panel */}
        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Configure: {REPORT_TYPE_CONFIG[selectedType].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Column Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Columns</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {REPORT_COLUMNS[selectedType].map((col) => (
                    <div key={col.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`col-${col.key}`}
                        checked={selectedColumns.includes(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label
                        htmlFor={`col-${col.key}`}
                        className="text-sm cursor-pointer"
                      >
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filters</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Date Range - for most report types */}
                  {['SALES_REPORT', 'FINANCIAL_REPORT', 'STOCK_MOVEMENT'].includes(
                    selectedType,
                  ) && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-foreground/60">
                          Date From
                        </Label>
                        <Input
                          type="date"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-foreground/60">
                          Date To
                        </Label>
                        <Input
                          type="date"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Status / Segment / Type filter */}
                  {getStatusFilters().length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground/60">
                        {getStatusFilterLabel()}
                      </Label>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`All ${getStatusFilterLabel()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_statuses">All</SelectItem>
                          {getStatusFilters().map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Category filter for inventory */}
                  {selectedType === 'INVENTORY_SUMMARY' && (
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground/60">
                        Category
                      </Label>
                      <Input
                        placeholder="Filter by category name"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="flex gap-3">
                  <Button
                    variant={format === 'CSV' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormat('CSV')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant={format === 'EXCEL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormat('EXCEL')}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleGenerateAndDownload}
                  disabled={isGenerating || selectedColumns.length === 0}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Generate &amp; Download
                </Button>

                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Report name to save..."
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSaveReport}
                    disabled={
                      isSaving ||
                      !reportName.trim() ||
                      selectedColumns.length === 0
                    }
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ==================== SAVED REPORTS ==================== */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Saved Reports</h2>

        {isLoadingReports ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : savedReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileBarChart className="w-12 h-12 text-foreground/20 mb-4" />
              <p className="text-foreground/50 text-lg">No saved reports yet</p>
              <p className="text-foreground/30 text-sm mt-1">
                Create and save a report above to see it here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((report) => {
              const typeConfig = REPORT_TYPE_CONFIG[report.reportType];
              const Icon = typeConfig?.icon ?? FileBarChart;

              return (
                <Card key={report.id} className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-foreground/60" />
                        <CardTitle className="text-base truncate">
                          {report.name}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {report.format}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Type</span>
                      <span className="font-medium">
                        {typeConfig?.label ?? report.reportType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Last Generated</span>
                      <span className="font-medium text-right text-xs">
                        {formatDate(report.lastGeneratedAt)}
                      </span>
                    </div>

                    {/* Schedule info */}
                    {report.scheduleFreq && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="w-3.5 h-3.5 text-foreground/50" />
                        <span className="text-foreground/60">
                          {report.scheduleFreq.toLowerCase()} to{' '}
                          {report.scheduledEmails.length > 0
                            ? report.scheduledEmails.join(', ')
                            : '(no recipients)'}
                        </span>
                      </div>
                    )}
                    {report.nextRunAt && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground/40">
                        <Calendar className="w-3 h-3" />
                        Next run: {formatDate(report.nextRunAt)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleDownloadSaved(report)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openScheduleDialog(report)}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== SCHEDULE DIALOG ==================== */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automatic report generation and delivery via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={scheduleFreq}
                onValueChange={(v) =>
                  setScheduleFreq(v as ScheduleFrequency | '')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (disable)</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={scheduleEmails}
                onChange={(e) => setScheduleEmails(e.target.value)}
              />
              <p className="text-xs text-foreground/40">
                Separate multiple emails with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isSavingSchedule}>
              {isSavingSchedule ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
