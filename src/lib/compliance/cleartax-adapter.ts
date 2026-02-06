/**
 * ClearTax GSP Adapter
 *
 * Real implementation for ClearTax GSP integration.
 * Handles e-Way Bill generation, e-Invoice (IRN), and GSTIN validation
 * through ClearTax's REST APIs.
 *
 * Environment variables required:
 *   CLEARTAX_API_KEY   - ClearTax API key / auth token
 *   CLEARTAX_BASE_URL  - Base URL (sandbox or production)
 *   CLEARTAX_GSTIN     - Business GSTIN for authentication
 */

import type {
  GSPAdapter,
  EWayBillParams,
  EInvoiceParams,
  GSTINValidationResult,
  GSPResponse,
} from './gsp-client';

const CLEARTAX_BASE_URL = process.env.CLEARTAX_BASE_URL || 'https://einvoicing.internal.cleartax.co/v2';
const CLEARTAX_EWAY_URL = process.env.CLEARTAX_EWAY_URL || 'https://ewayapi.internal.cleartax.co/api';
const CLEARTAX_API_KEY = process.env.CLEARTAX_API_KEY || '';
const CLEARTAX_GSTIN = process.env.CLEARTAX_GSTIN || '';

async function cleartaxFetch(url: string, method: string, body?: any): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-cleartax-auth-token': CLEARTAX_API_KEY,
      'x-cleartax-product': 'EInvoice',
      'gstin': CLEARTAX_GSTIN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || data.message || `ClearTax API error: ${res.status}`);
  }

  return data;
}

export class ClearTaxGSPAdapter implements GSPAdapter {
  name = 'ClearTax';

  /**
   * Generate an e-Way Bill via ClearTax
   */
  async generateEWayBill(params: EWayBillParams): Promise<GSPResponse> {
    try {
      if (!CLEARTAX_API_KEY) {
        return { success: false, error: 'ClearTax API key not configured. Set CLEARTAX_API_KEY environment variable.' };
      }

      const payload = {
        supplyType: 'O', // Outward
        subSupplyType: '1', // Supply
        docType: 'INV',
        docNo: params.invoiceNumber,
        docDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        fromGstin: CLEARTAX_GSTIN,
        fromPincode: parseInt(params.fromPincode),
        toGstin: 'URP', // Unregistered party default
        toPincode: parseInt(params.toPincode),
        transDistance: params.distance || 0,
        transporterId: params.transporterId || '',
        vehicleNo: params.vehicleNumber || '',
        transMode: params.vehicleNumber ? '1' : '4', // 1=Road, 4=Ship/Air
      };

      const data = await cleartaxFetch(
        `${CLEARTAX_EWAY_URL}/ewaybill/generate`,
        'POST',
        payload,
      );

      return {
        success: true,
        data: {
          ewayBillNumber: data.ewbNo || data.ewayBillNo,
          ewayBillDate: data.ewbDt || data.ewayBillDate,
          validUpto: data.ewbValidTill || data.validUpto,
          qrCode: data.qrCode,
        },
      };
    } catch (error: any) {
      console.error('[ClearTax] e-Way Bill generation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate an e-Invoice (IRN) via ClearTax
   */
  async generateEInvoice(params: EInvoiceParams): Promise<GSPResponse> {
    try {
      if (!CLEARTAX_API_KEY) {
        return { success: false, error: 'ClearTax API key not configured. Set CLEARTAX_API_KEY environment variable.' };
      }

      const payload = {
        transaction: {
          Version: '1.1',
          TranDtls: {
            TaxSch: 'GST',
            SupTyp: 'B2B',
            RegRev: 'N',
          },
          DocDtls: {
            Typ: 'INV',
            No: params.invoiceId,
            Dt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          },
          SellerDtls: {
            Gstin: CLEARTAX_GSTIN,
          },
          BuyerDtls: {
            Gstin: params.customerGst || 'URP',
          },
          ValDtls: {
            TotInvVal: params.totalAmount,
          },
          ItemList: params.items.map((item: any, idx: number) => ({
            SlNo: `${idx + 1}`,
            PrdDesc: item.name || item.productName || 'Product',
            HsnCd: item.hsnCode || '0000',
            Qty: item.quantity || 1,
            UnitPrice: item.unitPrice || item.price || 0,
            TotAmt: item.total || (item.quantity || 1) * (item.unitPrice || 0),
            GstRt: item.taxRate || item.gstRate || 18,
          })),
        },
      };

      const data = await cleartaxFetch(
        `${CLEARTAX_BASE_URL}/eInvoice/generate`,
        'PUT',
        payload,
      );

      return {
        success: true,
        data: {
          irn: data.govt_response?.Irn || data.irn,
          signedQrCode: data.govt_response?.SignedQRCode || data.signedQrCode,
          signedInvoice: data.govt_response?.SignedInvoice || data.signedInvoice,
          ackNo: data.govt_response?.AckNo,
          ackDate: data.govt_response?.AckDt,
        },
      };
    } catch (error: any) {
      console.error('[ClearTax] e-Invoice generation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate a GSTIN via ClearTax
   */
  async validateGSTIN(gstin: string): Promise<GSTINValidationResult> {
    try {
      if (!gstin || gstin.length !== 15) {
        return { valid: false, error: 'GSTIN must be 15 characters' };
      }

      if (!CLEARTAX_API_KEY) {
        // Fallback to basic regex validation if API key not configured
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return {
          valid: gstinRegex.test(gstin),
          error: gstinRegex.test(gstin) ? undefined : 'Invalid GSTIN format',
        };
      }

      const data = await cleartaxFetch(
        `${CLEARTAX_BASE_URL}/commonapi/search?gstin=${gstin}`,
        'GET',
      );

      return {
        valid: data.status_cd === '1' || data.sts === 'Active',
        legalName: data.lgnm || data.legal_name,
        status: data.sts || data.status,
      };
    } catch (error: any) {
      console.error('[ClearTax] GSTIN validation failed:', error.message);
      return { valid: false, error: error.message };
    }
  }
}
