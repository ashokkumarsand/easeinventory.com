'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  Download,
  DollarSign,
  Package,
  Users,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface OperationType {
  slug: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface PreviewError {
  row: number;
  field: string;
  message: string;
}

interface PreviewResult {
  valid: Record<string, string>[];
  errors: PreviewError[];
  summary: string;
}

interface ApplyResult {
  processed: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

// ============================================================
// Constants
// ============================================================

const OPERATIONS: OperationType[] = [
  {
    slug: 'price-update',
    label: 'Price Update',
    description: 'Update cost prices and sale prices for multiple products via SKU.',
    icon: DollarSign,
  },
  {
    slug: 'inventory-adjustment',
    label: 'Inventory Adjustment',
    description: 'Adjust inventory quantities for multiple products with reasons.',
    icon: Package,
  },
  {
    slug: 'customer-import',
    label: 'Customer Import',
    description: 'Import customers in bulk from a CSV file.',
    icon: Users,
  },
  {
    slug: 'supplier-import',
    label: 'Supplier Import',
    description: 'Import suppliers in bulk from a CSV file.',
    icon: Truck,
  },
];

// Column labels for preview table
const PREVIEW_COLUMNS: Record<string, string[]> = {
  'price-update': ['sku', 'productName', 'oldCostPrice', 'newCostPrice', 'oldSalePrice', 'newSalePrice'],
  'inventory-adjustment': ['sku', 'productName', 'currentQuantity', 'quantity', 'reason'],
  'customer-import': ['name', 'email', 'phone', 'company', 'city', 'state'],
  'supplier-import': ['name', 'contactPerson', 'email', 'phone', 'gstNumber', 'city'],
};

// ============================================================
// Page
// ============================================================

export default function BulkOperationsPage() {
  const [selected, setSelected] = useState<OperationType | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Download template ----
  const downloadTemplate = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/bulk/${selected.slug}`);
      if (!res.ok) throw new Error('Failed to download template');
      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selected.slug}-template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download template');
    }
  };

  // ---- File upload ----
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(null);
    setApplyResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  // ---- Preview ----
  const handlePreview = async () => {
    if (!selected || !csvContent) return;
    setPreviewLoading(true);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/bulk/${selected.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Preview failed');
      }
      const data: PreviewResult = await res.json();
      setPreview(data);
    } catch (err: any) {
      alert(err.message || 'Failed to preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ---- Apply ----
  const handleApply = async () => {
    if (!selected || !preview || preview.valid.length === 0) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/bulk/${selected.slug}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: preview.valid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Apply failed');
      }
      const data: ApplyResult = await res.json();
      setApplyResult(data);
    } catch (err: any) {
      alert(err.message || 'Failed to apply changes');
    } finally {
      setApplying(false);
    }
  };

  // ---- Reset ----
  const reset = () => {
    setSelected(null);
    setCsvContent(null);
    setFileName(null);
    setPreview(null);
    setApplyResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---- Get preview columns ----
  const columns = selected ? PREVIEW_COLUMNS[selected.slug] || [] : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {selected && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Upload className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">
          {selected ? selected.label : 'Bulk Operations'}
        </h1>
      </div>

      {/* Operation selection */}
      {!selected && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPERATIONS.map((op) => {
            const Icon = op.icon;
            return (
              <Card
                key={op.slug}
                className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
                onClick={() => setSelected(op)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{op.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{op.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selected operation workflow */}
      {selected && (
        <div className="space-y-6">
          {/* Step 1: Template & Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Upload CSV</CardTitle>
              <CardDescription>
                Download the template, fill in your data, then upload the CSV file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Choose CSV File
                  </Button>
                </div>
                {fileName && (
                  <span className="text-sm text-muted-foreground">
                    Selected: {fileName}
                  </span>
                )}
              </div>

              {csvContent && !preview && (
                <Button onClick={handlePreview} disabled={previewLoading}>
                  {previewLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Preview & Validate'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Preview */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Review</CardTitle>
                <CardDescription>{preview.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error summary */}
                {preview.errors.length > 0 && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">
                        {preview.errors.length} error(s) found
                      </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {preview.errors.map((err, i) => (
                        <p key={i} className="text-sm text-red-600/80">
                          Row {err.row}, {err.field}: {err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid data preview */}
                {preview.valid.length > 0 && (
                  <div className="rounded-md border">
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columns.map((col) => (
                              <TableHead key={col}>{col}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.valid.slice(0, 50).map((row, i) => (
                            <TableRow key={i}>
                              {columns.map((col) => (
                                <TableCell key={col} className="text-sm">
                                  {row[col] || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {preview.valid.length > 50 && (
                      <p className="px-4 py-2 text-sm text-muted-foreground">
                        Showing 50 of {preview.valid.length} rows
                      </p>
                    )}
                  </div>
                )}

                {/* Apply button */}
                {preview.valid.length > 0 && !applyResult && (
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full sm:w-auto"
                  >
                    {applying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Apply {preview.valid.length} Changes
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Result */}
          {applyResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-md border p-3 text-center">
                    <p className="text-2xl font-bold">{applyResult.processed}</p>
                    <p className="text-sm text-muted-foreground">Processed</p>
                  </div>
                  {applyResult.created > 0 && (
                    <div className="rounded-md border border-green-500/30 bg-green-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{applyResult.created}</p>
                      <p className="text-sm text-muted-foreground">Created</p>
                    </div>
                  )}
                  {applyResult.updated > 0 && (
                    <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{applyResult.updated}</p>
                      <p className="text-sm text-muted-foreground">Updated</p>
                    </div>
                  )}
                  {applyResult.failed > 0 && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{applyResult.failed}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  )}
                </div>

                {applyResult.errors.length > 0 && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
                    <p className="font-medium text-red-600 mb-2">Errors:</p>
                    {applyResult.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-600/80">{err}</p>
                    ))}
                  </div>
                )}

                {applyResult.failed === 0 && (
                  <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/5 p-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">
                      All changes applied successfully!
                    </span>
                  </div>
                )}

                <Button variant="outline" onClick={reset}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Start Another Operation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
