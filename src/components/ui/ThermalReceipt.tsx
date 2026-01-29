'use client';

import { QRCodeSVG } from 'qrcode.react';
import React from 'react';

interface ThermalReceiptProps {
  invoice: any;
  tenant: any;
}

export const ThermalReceipt = React.forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ invoice, tenant }, ref) => {
    if (!invoice || !tenant) return null;

    return (
      <div 
        ref={ref}
        className="thermal-receipt bg-white text-black p-4 font-mono text-[12px] leading-tight"
        style={{ width: '80mm', minHeight: '100mm' }}
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h2 className="text-sm font-bold uppercase">{tenant.name}</h2>
          <p className="text-[10px]">{tenant.address}</p>
          <p className="text-[10px]">GST: {tenant.gstNumber}</p>
          <p className="text-[10px]">Ph: {tenant.phone}</p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between mb-2">
          <span>Inv: #{invoice.invoiceNumber}</span>
          <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
        </div>
        <div className="mb-2 border-b border-dashed border-black pb-2">
            <p>Customer: {invoice.customer?.name || 'Walk-in'}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-2 text-[11px]">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left font-bold">ITEM</th>
              <th className="text-right font-bold">QTY</th>
              <th className="text-right font-bold">AMT</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-1">
                  <div>{item.description}</div>
                  <div className="text-[8px] opacity-60">HSN: {item.hsnCode || 'N/A'}</div>
                </td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">₹{Number(item.subtotal || item.unitPrice * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-dashed border-black pt-2 space-y-1">
          <div className="flex justify-between font-bold">
            <span>SUBTOTAL:</span>
            <span>₹{Number(invoice.subtotal || invoice.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>GST:</span>
            <span>₹{Number(invoice.taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-black pt-1">
            <span>GRAND TOTAL:</span>
            <span>₹{Number(invoice.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic UPI QR Code for instant payment */}
        {tenant.upiId && invoice.paymentStatus !== 'PAID' && (
           <div className="mt-4 flex flex-col items-center border-t border-dashed border-black pt-4">
              <p className="text-[10px] font-bold mb-2">SCAN TO PAY (UPI)</p>
              <div className="p-2 bg-white border border-black">
                <QRCodeSVG 
                    value={`upi://pay?pa=${tenant.upiId}&pn=${tenant.name}&am=${Number(invoice.total).toFixed(2)}&cu=INR&tn=Invoice ${invoice.invoiceNumber}`}
                    size={80}
              />
              </div>
              <p className="text-[8px] mt-1">{tenant.upiId}</p>
           </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 border-t border-dashed border-black pt-2">
          <p className="text-[10px]">Thank You for Visiting!</p>
          <p className="text-[8px] italic">E&OE. Subject to Jurisdiction.</p>
        </div>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .thermal-receipt, .thermal-receipt * {
              visibility: visible;
            }
            .thermal-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm !important;
              margin: 0;
              padding: 4mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}</style>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
