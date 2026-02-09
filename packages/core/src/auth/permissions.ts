// Permission module:action pattern
export const PERMISSIONS = {
  // Inventory
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_CREATE: "inventory:create",
  INVENTORY_EDIT: "inventory:edit",
  INVENTORY_DELETE: "inventory:delete",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_CREATE: "orders:create",
  ORDERS_EDIT: "orders:edit",
  ORDERS_DELETE: "orders:delete",

  // Shipments
  SHIPMENTS_VIEW: "shipments:view",
  SHIPMENTS_CREATE: "shipments:create",
  SHIPMENTS_EDIT: "shipments:edit",

  // Invoices
  INVOICES_VIEW: "invoices:view",
  INVOICES_CREATE: "invoices:create",
  INVOICES_DELETE: "invoices:delete",

  // Analytics
  ANALYTICS_VIEW: "analytics:view",

  // Purchase Orders
  PURCHASE_ORDERS_VIEW: "purchase-orders:view",
  PURCHASE_ORDERS_CREATE: "purchase-orders:create",
  PURCHASE_ORDERS_EDIT: "purchase-orders:edit",

  // Returns
  RETURNS_VIEW: "returns:view",
  RETURNS_CREATE: "returns:create",
  RETURNS_EDIT: "returns:edit",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",

  // Admin
  ADMIN_VIEW: "admin:view",
  ADMIN_EDIT: "admin:edit",
} as const;
