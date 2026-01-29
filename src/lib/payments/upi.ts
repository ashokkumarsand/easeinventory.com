/**
 * UPI (Unified Payments Interface) Utility for India
 * Generates dynamic payment strings according to NPCI specifications.
 */

export interface UPIParams {
  payeeAddress: string;     // pa: vpa id (e.g. business@okaxis)
  payeeName: string;        // pn: business name
  transactionId?: string;   // tid: unique transaction id
  transactionRef?: string;  // tr: order id / invoice number
  transactionNote?: string; // tn: note to show in app
  amount: number;           // am: amount in decimal format
  currency?: string;        // cu: currency code (defaults to INR)
}

/**
 * Generates a UPI URI string for use in QR codes.
 * Format: upi://pay?pa=...&pn=...&am=...&cu=...
 */
export function generateUPILink(params: UPIParams): string {
  const {
    payeeAddress,
    payeeName,
    amount,
    transactionRef,
    transactionNote,
    currency = 'INR'
  } = params;

  // NPCI Specification: upi://pay?pa=pa@vpa&pn=PayeeName&am=10.00&cu=INR&tn=Note
  const baseUrl = 'upi://pay';
  const queryParams = new URLSearchParams();

  queryParams.append('pa', payeeAddress);
  queryParams.append('pn', payeeName);
  queryParams.append('am', amount.toFixed(2));
  queryParams.append('cu', currency);
  
  if (transactionRef) queryParams.append('tr', transactionRef);
  if (transactionNote) queryParams.append('tn', transactionNote);

  return `${baseUrl}?${queryParams.toString()}`;
}
