import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getAIResponse, getQuickSuggestions, ChatMessage } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

// POST /api/help/ai-chat - Get AI response
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get user context if authenticated
    let userContext: {
      tenantName?: string;
      userName?: string;
      userRole?: string;
    } = {};

    if (session?.user) {
      const sessionUser = session.user as any;
      userContext = {
        userName: session.user.name || undefined,
        userRole: sessionUser.role || undefined,
      };

      // Get tenant name if available
      if (sessionUser.tenantId && sessionUser.tenantId !== 'system') {
        const tenant = await prisma.tenant.findUnique({
          where: { id: sessionUser.tenantId },
          select: { name: true },
        });
        userContext.tenantName = tenant?.name || undefined;
      }
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Rate limiting - simple in-memory check (in production, use Redis)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ai-chat:${clientIp}`;

    // Get AI response
    const response = await getAIResponse(
      message,
      conversationHistory as ChatMessage[],
      userContext
    );

    return NextResponse.json({
      success: true,
      response: response.message,
      suggestedActions: response.suggestedActions,
      relatedTopics: response.relatedTopics,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/help/ai-chat - Get quick suggestions
export async function GET() {
  try {
    const suggestions = getQuickSuggestions();

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error('Get Suggestions Error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
