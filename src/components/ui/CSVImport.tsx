'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useDisclosure } from '@/hooks/useDisclosure';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

interface CSVImportProps {
  title: string;
  description: string;
  templateUrl: string;
  importUrl: string;
  onSuccess?: () => void;
  requiredFields: string[];
  fieldMappings?: Record<string, string>;
}

interface ImportResult {
  success: boolean;
  imported?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  message?: string;
}

export default function CSVImport({
  title,
  description,
  templateUrl,
  importUrl,
  onSuccess,
  requiredFields,
  fieldMappings = {},
}: CSVImportProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((text: string): any[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        const mappedKey = fieldMappings[header] || header;
        row[mappedKey] = values[index]?.trim().replace(/^"|"$/g, '') || null;
      });
      data.push(row);
    }

    return data;
  }, [fieldMappings]);

  // Handle CSV lines with quoted values containing commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);

      if (data.length === 0) {
        setError('No valid data found in CSV');
        return;
      }

      // Validate required fields
      const firstRow = data[0];
      const missingFields = requiredFields.filter(
        (field) => !Object.keys(firstRow).includes(field) && !Object.values(fieldMappings).includes(field)
      );

      if (missingFields.length > 0) {
        setError(`Missing required columns: ${missingFields.join(', ')}`);
        return;
      }

      setParsedData(data);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(importUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [importUrl.includes('suppliers') ? 'suppliers' : 'products']: parsedData,
          importType: 'inventory'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.imported > 0 || data.updated > 0) {
          onSuccess?.();
        }
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = async () => {
    window.open(templateUrl, '_blank');
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <>
      <Button
        variant="secondary"
        className="font-bold rounded-2xl"
        onClick={onOpen}
      >
        <Upload size={18} className="mr-2" />
        Import CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-background dark:bg-card border border-foreground/10 max-w-lg">
          <DialogHeader className="border-b border-foreground/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet size={20} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black">{title}</DialogTitle>
                <p className="text-xs font-medium text-foreground/50">{description}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Template Download */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Download Template</p>
                  <p className="text-xs text-foreground/50">
                    Start with our CSV template to ensure correct formatting
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={downloadTemplate}
                >
                  <Download size={16} className="mr-2" />
                  Template
                </Button>
              </div>
            </div>

            {/* File Upload */}
            {!result && (
              <div
                className={`p-8 rounded-xl border-2 border-dashed transition-colors text-center ${
                  file
                    ? 'border-primary bg-primary/5'
                    : 'border-foreground/20 hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle size={40} className="mx-auto text-primary" />
                      <p className="font-bold">{file.name}</p>
                      <p className="text-sm text-foreground/50">
                        {parsedData.length} records ready to import
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={40} className="mx-auto text-foreground/30" />
                      <p className="font-bold">Click to upload CSV</p>
                      <p className="text-sm text-foreground/50">
                        or drag and drop your file here
                      </p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-destructive">Import Error</p>
                  <p className="text-xs text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                <Progress value={undefined} className="max-w-full animate-pulse" />
                <p className="text-sm text-center text-foreground/50">
                  Importing {parsedData.length} records...
                </p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle size={24} className="text-green-500" />
                    <p className="font-bold text-green-500">Import Complete</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-black text-green-500">{result.imported || 0}</p>
                      <p className="text-xs text-foreground/50">Created</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary">{result.updated || 0}</p>
                      <p className="text-xs text-foreground/50">Updated</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-yellow-500">{result.skipped || 0}</p>
                      <p className="text-xs text-foreground/50">Skipped</p>
                    </div>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="font-bold text-sm text-yellow-600 mb-2">Warnings</p>
                    <ul className="text-xs text-foreground/70 space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li className="text-foreground/50">
                          ...and {result.errors.length - 10} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-foreground/10 pt-4">
            {result ? (
              <Button onClick={handleClose} className="font-bold">
                Done
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleClose} className="font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isLoading || parsedData.length === 0}
                  className="font-bold"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Import {parsedData.length > 0 ? `${parsedData.length} Records` : ''}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
