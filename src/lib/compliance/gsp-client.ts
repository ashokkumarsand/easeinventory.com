/**
 * GSP (GST Suvidha Provider) Client Utility
 * This serves as a pluggable client for integrating with government-authorized GSPs 
 * like ClearTax, Cygnet, or Masters India using the Adapter Pattern.
 */

export interface EWayBillParams {
  invoiceNumber: string;
  transporterId?: string;
  vehicleNumber?: string;
  distance?: number;
  fromPincode: string;
  toPincode: string;
}

export interface EInvoiceParams {
  invoiceId: string;
  items: any[];
  customerGst?: string;
  totalAmount: number;
}

export interface GSTINValidationResult {
  valid: boolean;
  legalName?: string;
  status?: string;
  error?: string;
}

export interface GSPResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Interface that all GSP Adapters must implement
 */
export interface GSPAdapter {
  name: string;
  generateEWayBill(params: EWayBillParams): Promise<GSPResponse>;
  generateEInvoice(params: EInvoiceParams): Promise<GSPResponse>;
  validateGSTIN(gstin: string): Promise<GSTINValidationResult>;
}

/**
 * Mock implementation for development and testing
 */
class MockGSPAdapter implements GSPAdapter {
  name = 'MockGSP';

  async generateEWayBill(params: EWayBillParams): Promise<GSPResponse> {
    console.log('[MockGSP] Generating e-Way Bill:', params.invoiceNumber);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            ewayBillNumber: `EWB-${Math.floor(Math.random() * 1000000000000)}`,
            ewayBillDate: new Date().toISOString(),
            qrCode: 'https://example.com/mock-qr-code',
          }
        });
      }, 1000);
    });
  }

  async generateEInvoice(params: EInvoiceParams): Promise<GSPResponse> {
    console.log('[MockGSP] Generating e-Invoice:', params.invoiceId);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            irn: `IRN-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
            signedQrCode: 'MOCK_SIGNED_QR_DATA',
            signedInvoice: 'MOCK_SIGNED_JSON_DATA',
          }
        });
      }, 1200);
    });
  }

  async validateGSTIN(gstin: string): Promise<GSTINValidationResult> {
    if (!gstin || gstin.length !== 15) return { valid: false, error: 'Invalid length' };
    return {
      valid: true,
      legalName: 'MOCK BUSINESS SOLUTIONS PVT LTD',
      status: 'ACTIVE',
    };
  }
}

/**
 * Main GSP Client that uses an adapter to perform actions
 */
export class GSPClient {
  private static instance: GSPClient;
  private adapter: GSPAdapter;

  private constructor(adapter: GSPAdapter) {
    this.adapter = adapter;
  }

  public static getInstance(adapter?: GSPAdapter): GSPClient {
    if (!GSPClient.instance) {
      GSPClient.instance = new GSPClient(adapter || new MockGSPAdapter());
    }
    return GSPClient.instance;
  }

  /**
   * Allows switching adapters at runtime (e.g., for different regions)
   */
  public setAdapter(adapter: GSPAdapter) {
    this.adapter = adapter;
    console.log(`GSPClient: Adapter switched to ${adapter.name}`);
  }

  async generateEWayBill(params: EWayBillParams) {
    return this.adapter.generateEWayBill(params);
  }

  async generateEInvoice(params: EInvoiceParams) {
    return this.adapter.generateEInvoice(params);
  }

  async validateGSTIN(gstin: string) {
    return this.adapter.validateGSTIN(gstin);
  }
}

export const gspClient = GSPClient.getInstance();
