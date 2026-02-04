/* eslint-disable @typescript-eslint/no-explicit-any */

// Define fonts - using built-in fonts
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

async function getPrinter() {
  const pdfmakeModule = await import('pdfmake');
  const PdfPrinter = pdfmakeModule.default as any;
  return new PdfPrinter(fonts);
}

interface GSTReportData {
  tenantName: string;
  gstin: string;
  month: string;
  summary: {
    totalAmount: number;
    totalTax: number;
    totalB2B: number;
    totalB2C: number;
    invoiceCount: number;
  };
  invoices: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    customerName: string;
    customerGstin: string;
    placeOfSupply: string;
    totalValue: string;
    taxableValue: string;
    gstRate: string;
    cgst: string;
    sgst: string;
    igst: string;
  }>;
}

export async function generateGSTReportPDF(data: GSTReportData): Promise<Buffer> {
  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 60, 40, 60],

    header: {
      columns: [
        {
          text: 'GSTR-1 Summary Report',
          style: 'header',
          margin: [40, 20, 0, 0],
        },
        {
          text: `Generated: ${new Date().toLocaleDateString('en-IN')}`,
          alignment: 'right',
          margin: [0, 25, 40, 0],
          fontSize: 9,
          color: '#666',
        },
      ],
    },

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: 'EaseInventory - GST Compliance Report',
          fontSize: 8,
          color: '#888',
          margin: [40, 0, 0, 0],
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'right',
          fontSize: 8,
          color: '#888',
          margin: [0, 0, 40, 0],
        },
      ],
      margin: [0, 20, 0, 0],
    }),

    content: [
      // Business Info Section
      {
        columns: [
          {
            width: '60%',
            stack: [
              { text: data.tenantName, style: 'businessName' },
              { text: `GSTIN: ${data.gstin || 'Not Registered'}`, style: 'gstin' },
            ],
          },
          {
            width: '40%',
            alignment: 'right',
            stack: [
              { text: `Report Period: ${data.month}`, style: 'period' },
              { text: `Total Invoices: ${data.summary.invoiceCount}`, fontSize: 10, color: '#666' },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Summary Cards
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              createSummaryCell('Total Sales (Taxable)', formatCurrency(data.summary.totalAmount)),
              createSummaryCell('Output GST', formatCurrency(data.summary.totalTax)),
              createSummaryCell('B2B Sales', formatCurrency(data.summary.totalB2B)),
              createSummaryCell('B2C Sales', formatCurrency(data.summary.totalB2C)),
            ],
          ],
        },
        layout: {
          fillColor: () => '#f8f9fa',
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 15,
          paddingRight: () => 15,
          paddingTop: () => 12,
          paddingBottom: () => 12,
        },
        margin: [0, 0, 0, 25],
      },

      // Invoice Details Header
      { text: 'Invoice Details', style: 'sectionHeader', margin: [0, 0, 0, 10] },

      // Invoice Table
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            // Header Row
            [
              { text: 'Invoice No.', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' },
              { text: 'Customer', style: 'tableHeader' },
              { text: 'GSTIN', style: 'tableHeader' },
              { text: 'State', style: 'tableHeader' },
              { text: 'Taxable', style: 'tableHeader' },
              { text: 'GST %', style: 'tableHeader' },
              { text: 'CGST', style: 'tableHeader' },
              { text: 'SGST', style: 'tableHeader' },
              { text: 'Total', style: 'tableHeader' },
            ],
            // Data Rows
            ...data.invoices.map((inv) => [
              { text: inv.invoiceNumber, fontSize: 8 },
              { text: inv.invoiceDate, fontSize: 8 },
              { text: truncate(inv.customerName, 20), fontSize: 8 },
              { text: inv.customerGstin || 'URP', fontSize: 7, color: inv.customerGstin ? '#333' : '#999' },
              { text: truncate(inv.placeOfSupply, 10), fontSize: 8 },
              { text: formatCurrency(parseFloat(inv.taxableValue)), fontSize: 8, alignment: 'right' as const },
              { text: `${inv.gstRate}%`, fontSize: 8, alignment: 'center' as const },
              { text: formatCurrency(parseFloat(inv.cgst)), fontSize: 8, alignment: 'right' as const },
              { text: formatCurrency(parseFloat(inv.sgst)), fontSize: 8, alignment: 'right' as const },
              { text: formatCurrency(parseFloat(inv.totalValue)), fontSize: 8, alignment: 'right' as const, bold: true },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#6A3BF6' : rowIndex % 2 === 0 ? '#fafafa' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#e0e0e0',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },

      // Totals Row
      {
        table: {
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'TOTALS', style: 'totalLabel' },
              { text: formatCurrency(data.summary.totalAmount - data.summary.totalTax), style: 'totalValue' },
              { text: formatCurrency(data.summary.totalTax / 2), style: 'totalValue' },
              { text: formatCurrency(data.summary.totalTax / 2), style: 'totalValue' },
              { text: formatCurrency(data.summary.totalAmount), style: 'totalValueBold' },
            ],
          ],
        },
        layout: {
          fillColor: () => '#1a1a1a',
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 10,
          paddingBottom: () => 10,
        },
        margin: [0, 0, 0, 20],
      },

      // Disclaimer
      {
        text: 'This is a computer-generated report. Please verify all details before filing with the GST portal.',
        fontSize: 8,
        color: '#888',
        italics: true,
        margin: [0, 20, 0, 0],
      },
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#6A3BF6',
      },
      businessName: {
        fontSize: 16,
        bold: true,
        color: '#333',
      },
      gstin: {
        fontSize: 11,
        color: '#666',
        margin: [0, 4, 0, 0],
      },
      period: {
        fontSize: 12,
        bold: true,
        color: '#6A3BF6',
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        color: '#333',
      },
      tableHeader: {
        fontSize: 8,
        bold: true,
        color: 'white',
      },
      totalLabel: {
        fontSize: 10,
        bold: true,
        color: 'white',
      },
      totalValue: {
        fontSize: 10,
        color: 'white',
        alignment: 'right',
      },
      totalValueBold: {
        fontSize: 10,
        bold: true,
        color: 'white',
        alignment: 'right',
      },
    },
  };

  const printer = await getPrinter();

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

function createSummaryCell(label: string, value: string): any {
  return {
    stack: [
      { text: label, fontSize: 8, color: '#666', margin: [0, 0, 0, 4] },
      { text: value, fontSize: 14, bold: true, color: '#333' },
    ],
  };
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
