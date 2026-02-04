import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Knowledge base context for EaseInventory
const SYSTEM_CONTEXT = `You are EaseInventory AI Assistant, a helpful support bot for EaseInventory - a multi-tenant SaaS inventory management platform built for Indian businesses.

## About EaseInventory
EaseInventory provides:
- Inventory tracking with barcode/QR support
- Repair management and service tracking
- GST-compliant invoicing with HSN codes
- Multi-location stock management
- HR/Payroll management
- Supplier management
- Custom subdomain support per tenant
- WhatsApp integration for notifications

## Key Features You Can Help With:

### Inventory Management
- Adding/editing products with SKU, barcode, HSN codes
- Stock levels and low-stock alerts
- Multi-location inventory transfers
- Batch scanning and quick add
- Product categories and suppliers

### Invoices & Billing
- Creating GST-compliant invoices
- GSTR-1 export for tax filing
- Payment tracking
- Customer management

### Repairs & Services
- Creating repair tickets
- Tracking repair status
- Managing technicians
- Customer notifications

### Team Management
- Adding team members
- Role-based permissions (Owner, Manager, Accountant, Technician, Sales Staff, Viewer)
- Custom roles with granular permissions

### HR & Attendance
- Employee management
- Attendance tracking with GPS
- Leave management
- Payroll processing
- Holiday calendar

### Settings
- Business profile and GST details
- Custom domain setup
- WhatsApp integration
- Audit logs

## Response Guidelines:
1. Be concise and helpful
2. Provide step-by-step instructions when needed
3. Reference specific menu paths (e.g., "Go to Dashboard > Inventory > Add Product")
4. For technical issues, suggest checking browser console or contacting support
5. For billing questions, direct to Dashboard > Settings > Billing
6. Always be polite and professional
7. If unsure, acknowledge limitations and suggest contacting support@easeinventory.com

## Common Issues & Solutions:
- Login issues: Check workspace slug, clear browser cache, try incognito mode
- Stock not updating: Refresh page, check stock transfer approvals
- Invoice errors: Verify GST numbers, check HSN codes
- Slow performance: Clear browser cache, check internet connection
`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  suggestedActions?: string[];
  relatedTopics?: string[];
}

/**
 * Get AI response for user query
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  userContext?: {
    tenantName?: string;
    userName?: string;
    userRole?: string;
  }
): Promise<AIResponse> {
  try {
    // Build context with user info
    let contextualSystem = SYSTEM_CONTEXT;
    if (userContext) {
      contextualSystem += `\n\n## Current User Context:
- Business: ${userContext.tenantName || 'Unknown'}
- User: ${userContext.userName || 'Unknown'}
- Role: ${userContext.userRole || 'Unknown'}`;
    }

    // Build messages array
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: contextualSystem,
      messages,
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');
    const messageText = textContent?.type === 'text' ? textContent.text : 'I apologize, but I could not generate a response.';

    // Extract suggested actions and related topics from response
    const suggestedActions = extractSuggestedActions(messageText);
    const relatedTopics = extractRelatedTopics(userMessage);

    return {
      message: messageText,
      suggestedActions,
      relatedTopics,
    };
  } catch (error: any) {
    console.error('AI Service Error:', error);

    // Fallback to keyword-based response if AI fails
    return getFallbackResponse(userMessage);
  }
}

/**
 * Extract suggested actions from AI response
 */
function extractSuggestedActions(response: string): string[] {
  const actions: string[] = [];

  // Look for navigation suggestions
  if (response.includes('Dashboard >') || response.includes('Go to')) {
    const matches = response.match(/(?:Go to |Navigate to |Visit )([^.]+)/gi);
    if (matches) {
      actions.push(...matches.slice(0, 3));
    }
  }

  return actions;
}

/**
 * Get related topics based on user query
 */
function extractRelatedTopics(query: string): string[] {
  const topics: string[] = [];
  const queryLower = query.toLowerCase();

  const topicMap: Record<string, string[]> = {
    inventory: ['Stock Transfers', 'Low Stock Alerts', 'Barcode Scanning'],
    product: ['Add Product', 'Categories', 'Suppliers'],
    invoice: ['GST Invoicing', 'GSTR-1 Export', 'Payments'],
    repair: ['Create Ticket', 'Assign Technician', 'Track Status'],
    team: ['Add Member', 'Roles & Permissions', 'Custom Roles'],
    employee: ['Attendance', 'Leave Management', 'Payroll'],
    settings: ['Business Profile', 'Custom Domain', 'WhatsApp Setup'],
  };

  for (const [keyword, relatedTopics] of Object.entries(topicMap)) {
    if (queryLower.includes(keyword)) {
      topics.push(...relatedTopics);
    }
  }

  return [...new Set(topics)].slice(0, 4);
}

/**
 * Fallback response when AI is unavailable
 */
function getFallbackResponse(query: string): AIResponse {
  const queryLower = query.toLowerCase();

  // Basic keyword matching for common queries
  const responses: Record<string, AIResponse> = {
    inventory: {
      message:
        'To manage inventory, go to **Dashboard > Inventory**. From there you can:\n\n1. **Add Products** - Click "Add Product" to create new items\n2. **View Stock** - See all products and their quantities\n3. **Transfers** - Move stock between locations\n\nNeed more specific help? Try asking about a particular feature!',
      suggestedActions: ['Add Product', 'View Stock', 'Stock Transfer'],
      relatedTopics: ['Barcode Scanning', 'Low Stock Alerts', 'Categories'],
    },
    invoice: {
      message:
        'For invoicing, navigate to **Dashboard > Invoices**. You can:\n\n1. **Create Invoice** - Generate GST-compliant invoices\n2. **Export GSTR-1** - Download for tax filing\n3. **Track Payments** - Mark invoices as paid\n\nAll invoices include HSN codes and proper GST calculations.',
      suggestedActions: ['Create Invoice', 'Export GSTR-1', 'View Payments'],
      relatedTopics: ['GST Settings', 'Customer Management', 'Payment Terms'],
    },
    repair: {
      message:
        'For repair management, go to **Dashboard > Repairs**. Features include:\n\n1. **Create Ticket** - Log new repair requests\n2. **Assign Technician** - Allocate work to team members\n3. **Track Progress** - Monitor repair status\n4. **Notify Customer** - Send WhatsApp updates\n\nRepair tickets support full lifecycle tracking.',
      suggestedActions: ['New Repair Ticket', 'Assign Technician', 'View All Repairs'],
      relatedTopics: ['Customer Notifications', 'Service History', 'Parts Inventory'],
    },
    default: {
      message:
        "I'm here to help with EaseInventory! I can assist with:\n\n- **Inventory** - Products, stock, transfers\n- **Invoicing** - GST invoices, GSTR-1\n- **Repairs** - Service tickets, tracking\n- **Team** - Members, roles, permissions\n- **HR** - Attendance, leaves, payroll\n\nWhat would you like to know more about?",
      suggestedActions: ['Inventory Help', 'Invoice Help', 'Repair Help'],
      relatedTopics: ['Getting Started', 'Settings', 'Contact Support'],
    },
  };

  // Find matching response
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && queryLower.includes(keyword)) {
      return response;
    }
  }

  return responses.default;
}

/**
 * Get quick suggestions for empty state
 */
export function getQuickSuggestions(): string[] {
  return [
    'How do I add a new product?',
    'How to create a GST invoice?',
    'How to track repairs?',
    'How to add team members?',
    'How to set up WhatsApp?',
    'How to export GSTR-1?',
  ];
}
