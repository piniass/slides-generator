import { NextRequest, NextResponse } from 'next/server';

/**
 * Chat Assistant API Endpoint
 * 
 * POST /api/chat-assistant - Chat with AI assistant using context from user profile and generated hooks
 */

interface ChatAssistantRequest {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  profileData?: {
    core_idea?: string;
    pain_point?: string;
    audience_profile?: string[];
    technical_level?: string;
    product_role?: string;
    intensity_level?: number;
    content_goal?: string;
    language?: string;
  };
  generatedHooks?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatAssistantRequest = await request.json();
    const { message, conversationHistory, profileData, generatedHooks } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Build context from profile data and generated hooks
    let contextPrompt = `You are a senior TikTok content strategist and AI assistant helping with content creation. You have access to the user's profile configuration and their generated hooks.

Your role is to:
- Provide strategic advice on content creation
- Suggest improvements to hooks
- Help optimize content for TikTok
- Answer questions about the content strategy
- Provide creative suggestions based on the user's context

Be helpful, concise, and actionable. Write in ${profileData?.language || 'English'}.`;

    // Add profile context
    if (profileData) {
      contextPrompt += `\n\nUSER PROFILE CONTEXT:`;
      
      if (profileData.core_idea) {
        contextPrompt += `\n- Core idea: "${profileData.core_idea}"`;
      }
      
      if (profileData.pain_point) {
        contextPrompt += `\n- Main pain point: "${profileData.pain_point}"`;
      }
      
      if (profileData.audience_profile && profileData.audience_profile.length > 0) {
        contextPrompt += `\n- Audience: ${profileData.audience_profile.join(', ')}`;
      }
      
      if (profileData.technical_level) {
        contextPrompt += `\n- Knowledge level: ${profileData.technical_level}`;
      }
      
      if (profileData.product_role) {
        contextPrompt += `\n- Solution role: ${profileData.product_role}`;
      }
      
      if (profileData.intensity_level !== undefined && profileData.intensity_level !== null) {
        contextPrompt += `\n- Message intensity: ${profileData.intensity_level}/5`;
      }
      
      if (profileData.content_goal) {
        contextPrompt += `\n- Content goal: ${profileData.content_goal}`;
      }
    }

    // Add generated hooks context
    if (generatedHooks && generatedHooks.length > 0) {
      contextPrompt += `\n\nGENERATED HOOKS (${generatedHooks.length} hooks):`;
      generatedHooks.forEach((hook, index) => {
        contextPrompt += `\n${index + 1}. "${hook}"`;
      });
      contextPrompt += `\n\nThese are the hooks that were generated for the user's TikTok slides. You can reference them, suggest improvements, or help create variations.`;
    }

    // Build conversation messages
    const messages = [
      {
        role: 'system' as const,
        content: contextPrompt,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI assistant. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices[0]?.message?.content;

    if (!assistantResponse) {
      return NextResponse.json(
        { error: 'No response generated from AI assistant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in chat assistant:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}











