import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple help bot API that provides answers based on keywords.
 * In production, this would be connected to OpenAI or similar LLM.
 */

const knowledge = [
  {
    keywords: ['add', 'product', 'inventory', 'create'],
    response: `To add products to your inventory:

1. Go to **Dashboard → Inventory**
2. Click the **"Add Product"** button
3. Enter product details (name, serial number, category)
4. Set pricing (cost price, MRP, sale price)
5. Click **"Save"**

You can also bulk import products using CSV. Visit /help/inventory for a complete guide.`,
  },
  {
    keywords: ['invoice', 'gst', 'bill', 'billing'],
    response: `To create a GST-compliant invoice:

1. Go to **Dashboard → Invoices**
2. Click **"New Invoice"**
3. Select or add a customer
4. Add products from inventory
5. Apply discounts if needed
6. Click **"Generate Invoice"**

The system automatically calculates GST (CGST/SGST or IGST) based on your business location. Visit /help/invoicing for more details.`,
  },
  {
    keywords: ['team', 'user', 'role', 'permission', 'staff'],
    response: `To manage team members:

1. Go to **Settings → Team**
2. Click **"Add Team Member"**
3. Enter their email and assign a role:
   - **Admin**: Full access
   - **Manager**: Most features, no settings
   - **Staff**: Limited to day-to-day operations

Each team member will receive an email invitation. Visit /help/team for role details.`,
  },
  {
    keywords: ['report', 'export', 'download', 'csv', 'pdf'],
    response: `To export reports:

1. Go to **Dashboard → Reports**
2. Select the report type (Sales, Inventory, GST)
3. Choose date range
4. Click **"Export"** and select format (CSV or PDF)

Pro tip: Set up automated weekly reports in Settings → Notifications.`,
  },
  {
    keywords: ['repair', 'service', 'ticket', 'job'],
    response: `To create a repair ticket:

1. Go to **Dashboard → Repairs**
2. Click **"New Repair Ticket"**
3. Select or add customer
4. Describe the issue and add device details
5. Set estimated cost and deadline
6. Click **"Create Ticket"**

Status updates are automatically sent to customers via SMS/WhatsApp.`,
  },
  {
    keywords: ['login', 'password', 'forgot', 'reset', 'access'],
    response: `For login issues:

- **Forgot password?** Click "Forgot Password" on the login page
- **Account locked?** Contact support@easeinventory.com
- **New device?** You may need to verify via OTP

For security, sessions expire after 24 hours of inactivity.`,
  },
  {
    keywords: ['price', 'plan', 'subscription', 'cost', 'free'],
    response: `EaseInventory offers flexible plans:

- **Free**: Up to 100 products, 1 user
- **Starter** (₹499/mo): 1,000 products, 3 users
- **Business** (₹999/mo): Unlimited products, 10 users
- **Enterprise**: Custom pricing, dedicated support

All plans include GST invoicing, reports, and mobile access.`,
  },
];

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Find the knowledge item with the most keyword matches
  let bestMatch = {
    response: "I'm not sure about that. Here are some options:\n\n" +
      "• Visit our **Help Center** at /help\n" +
      "• Check our **Blog** for tutorials at /blog\n" +
      "• Contact support at **support@easeinventory.com**\n\n" +
      "Is there something specific I can help you with?",
    score: 0,
  };

  for (const item of knowledge) {
    const score = item.keywords.filter((kw) => lowerMessage.includes(kw)).length;
    if (score > bestMatch.score) {
      bestMatch = { response: item.response, score };
    }
  }

  return bestMatch.response;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = findBestResponse(message);

    return NextResponse.json({ response });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
