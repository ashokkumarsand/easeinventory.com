'use client';

import { TableEmptyState } from '@/components/ui/EmptyState';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useMemo, useRef } from 'react';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom theme matching our design system - using CSS variables for theme awareness
const customTheme = themeQuartz.withParams({
  accentColor: '#65A30D',
  backgroundColor: 'var(--card-bg)',
  foregroundColor: 'var(--foreground)',
  borderColor: 'rgba(0, 0, 0, 0.05)',
  headerBackgroundColor: 'rgba(0, 0, 0, 0.02)',
  headerTextColor: 'rgba(0, 0, 0, 0.4)',
  oddRowBackgroundColor: 'transparent',
  rowHoverColor: 'rgba(0, 0, 0, 0.02)',
  selectedRowBackgroundColor: 'rgba(101, 163, 13, 0.1)',
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  fontSize: 14,
  headerFontSize: 10,
  headerFontWeight: 800,
  cellTextColor: 'var(--foreground)',
  rowBorder: true,
  wrapperBorderRadius: 24,
  headerColumnResizeHandleColor: 'rgba(101, 163, 13, 0.3)',
});

interface DataTableProps<T> {
  /** Row data array */
  data: T[];
  /** Column definitions */
  columns: ColDef<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Row height in pixels */
  rowHeight?: number;
  /** Header height in pixels */
  headerHeight?: number;
  /** Enable row selection */
  rowSelection?: 'single' | 'multiple';
  /** Called when selection changes */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Called when row is clicked */
  onRowClick?: (row: T) => void;
  /** Callback to add first item (shows in empty state) */
  onAddFirst?: () => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Grid height */
  height?: string | number;
}

/**
 * DataTable Component
 * Virtualized table using AG Grid with custom theming
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  rowHeight = 60,
  headerHeight = 56,
  rowSelection,
  onSelectionChange,
  onRowClick,
  onAddFirst,
  emptyMessage = 'No records found',
  emptyComponent,
  className = '',
  height = 500,
}: DataTableProps<T>) {
  const gridRef = useRef<AgGridReact>(null);

  // Default column settings
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  }), []);

  // Handle selection change
  const handleSelectionChange = useCallback(() => {
    if (onSelectionChange && gridRef.current) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      onSelectionChange(selectedRows);
    }
  }, [onSelectionChange]);

  // Handle row click
  const handleRowClicked = useCallback((event: any) => {
    if (onRowClick) {
      onRowClick(event.data);
    }
  }, [onRowClick]);

  // Custom overlay for empty state
  const noRowsOverlay = useMemo(() => {
    return () => (
      emptyComponent || (
        <TableEmptyState
          message={emptyMessage}
          onAdd={onAddFirst}
          addLabel="Add First Item"
        />
      )
    );
  }, [emptyComponent, emptyMessage, onAddFirst]);

  // Custom loading overlay
  const loadingOverlay = useMemo(() => {
    return () => (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-bold text-foreground/40">Loading...</span>
        </div>
      </div>
    );
  }, []);

  return (
    <div
      className={`ag-theme-quartz rounded-3xl overflow-hidden theme-table-wrapper ${className}`}
      style={{ height }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={data}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        theme={customTheme}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        rowSelection={rowSelection ? { mode: rowSelection === 'single' ? 'singleRow' : 'multiRow' } : undefined}
        onSelectionChanged={handleSelectionChange}
        onRowClicked={handleRowClicked}
        loading={isLoading}
        noRowsOverlayComponent={noRowsOverlay}
        loadingOverlayComponent={loadingOverlay}
        suppressCellFocus
        suppressRowHoverHighlight={false}
        pagination
        paginationPageSize={20}
        paginationPageSizeSelector={[10, 20, 50, 100]}
      />
    </div>
  );
}

/**
 * Helper to create text cell renderer
 */
export const TextCell = ({ value }: { value: string }) => (
  <span className="font-medium">{value}</span>
);

/**
 * Helper to create badge/chip cell renderer
 */
export const ChipCell = ({ 
  value, 
  color = 'default' 
}: { 
  value: string; 
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    default: 'bg-foreground/5 text-foreground/60',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colorClasses[color]}`}>
      {value}
    </span>
  );
};

/**
 * Helper to create currency cell renderer
 */
export const CurrencyCell = ({ 
  value, 
  currency = '₹' 
}: { 
  value: number; 
  currency?: string;
}) => (
  <span className="font-bold">
    {currency}{value.toLocaleString()}
  </span>
);

export default DataTable;
