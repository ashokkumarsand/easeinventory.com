/**
 * HSN/SAC Master Directory for Indian GST
 * Contains common codes for electronics, furniture, and services.
 */

export interface HSNCode {
  code: string;
  description: string;
  gstRate: number; // Percentage
  type: 'HSN' | 'SAC';
}

export const HSN_MASTER: HSNCode[] = [
  // Electronics & Mobile (Commonly handled in inventory apps)
  { code: '8517', description: 'Smartphones and Telephones', gstRate: 18, type: 'HSN' },
  { code: '8471', description: 'Computers, Laptops and Data Processing Units', gstRate: 18, type: 'HSN' },
  { code: '8528', description: 'Monitors and Projectors', gstRate: 18, type: 'HSN' },
  { code: '8504', description: 'Power Adapters and Chargers', gstRate: 18, type: 'HSN' },
  { code: '8518', description: 'Headphones and Earphones', gstRate: 18, type: 'HSN' },
  
  // Storage & Accessories
  { code: '8523', description: 'External Hard Drives, Pen Drives', gstRate: 18, type: 'HSN' },
  { code: '8443', description: 'Printers and Scanners', gstRate: 12, type: 'HSN' },
  
  // General Household / Furniture (If applicable)
  { code: '9403', description: 'Office Furniture', gstRate: 18, type: 'HSN' },
  
  // Services (SAC)
  { code: '9987', description: 'Maintenance and Repair Services (Electronics)', gstRate: 18, type: 'SAC' },
  { code: '9983', description: 'IT Design and Development Services', gstRate: 18, type: 'SAC' },
  { code: '9985', description: 'Business Support Services', gstRate: 18, type: 'SAC' },
];

/**
 * Searches the HSN master for matches by code or description.
 */
export function searchHSN(query: string): HSNCode[] {
  const lowerQuery = query.toLowerCase();
  return HSN_MASTER.filter(item => 
    item.code.includes(query) || 
    item.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Returns the GST rate for a given HSN code.
 * Falls back to 18% if not found.
 */
export function getGSTRate(code: string): number {
  const match = HSN_MASTER.find(item => item.code === code);
  return match ? match.gstRate : 18;
}
