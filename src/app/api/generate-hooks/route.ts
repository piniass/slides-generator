import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate Hooks API Endpoint
 * 
 * POST /api/generate-hooks - Generate hooks using OpenAI
 */

interface GenerateHooksRequest {
  hookIdea: string;
  count: number;
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
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateHooksRequest = await request.json();
    const { hookIdea, count, profileData } = body;

    // Validate required fields
    if (!hookIdea || !count) {
      return NextResponse.json(
        { error: 'hookIdea and count are required' },
        { status: 400 }
      );
    }

    // We need at least 2 slides to satisfy: slide 2 mentions the brand, last slide is CTA.
    if (count < 2 || count > 20) {
      return NextResponse.json(
        { error: 'count must be between 2 and 20' },
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

    // Build a prompt that returns ONLY clean slide lines.
    // IMPORTANT: These lines are later rendered on images, so we must not return templates, instructions, or extra text.
    const language = profileData?.language || 'English';
    const coreIdea = profileData?.core_idea?.trim();
    const painPoint = profileData?.pain_point?.trim();
    const audience = profileData?.audience_profile?.filter(Boolean).join(', ');
    const technicalLevel = profileData?.technical_level?.trim();
    const contentGoal = profileData?.content_goal?.trim();
    const siteUrl = 'www.100vibecoding.com';
    const brandName = '100vibecoding';

    const systemPrompt = `You are a senior TikTok slide strategist who consistently creates viral, high-retention educational content.

Goal: Turn the user's input into a compelling ${count}-slide TikTok carousel script that is simple, punchy, and scroll-stopping.

Hard constraints (must follow):
- Output exactly ${count} lines.
- Line 1 = Slide 1, line 2 = Slide 2, ... line ${count} = Slide ${count}.
- Each line must be plain text only (no headings, no labels like "Slide 1:", no quotes, no bullets, no numbering).
- Each slide: 1–2 short sentences, max ~14 words total.
- No emojis. No hashtags.
- Do NOT repeat the user input verbatim.
- Do NOT include instructions, templates, or meta text in the output.

Narrative constraints:
- Slide 1: strongest hook (uncomfortable truth / curiosity / FOMO) about the pain.
- Slide 2: introduce the solution and MUST mention "${brandName}" exactly once.
- Middle slides: 1 clear insight per slide, actionable and credible (no hype).
- Last slide: strong CTA to visit the website. Must include the URL provided by the user context.

Tone: senior, direct, specific, educational. Write in ${language}.`;

    const userPrompt = [
      `Input idea: ${hookIdea.trim()}`,
      coreIdea ? `Core idea: ${coreIdea}` : null,
      painPoint ? `Main pain point: ${painPoint}` : null,
      audience ? `Audience: ${audience}` : null,
      technicalLevel ? `Knowledge level: ${technicalLevel}` : null,
      contentGoal ? `Content goal: ${contentGoal}` : null,
      `Brand name (must be on slide 2): ${brandName}`,
      `Website URL for CTA (must be on the last slide): ${siteUrl || '[MISSING_URL]'}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
        body: JSON.stringify({
          // Keep consistent with the rest of the app; this route needs reliable plain-text output.
          model: 'gpt-5.2',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.8,
          max_completion_tokens: 500,
        }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate hooks. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the hooks (split by newlines and clean up).
    // Note: do NOT drop numbered lines; instead strip the numbering prefix.
    const hooks = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) =>
        line
          // remove common list prefixes, but keep the actual hook text
          .replace(/^[-•]\s+/, '')
          .replace(/^\(?\d+\)?[\.\)]\s+/, '')
          .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
          .trim()
      )
      .filter((line: string) => line.length > 0)
      .slice(0, count);

    // If we got fewer hooks than requested, pad with the idea (better than returning empty strings)
    while (hooks.length < count) {
      hooks.push(hooks[hooks.length % hooks.length] || hookIdea);
    }

    return NextResponse.json({
      success: true,
      hooks: hooks.slice(0, count),
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error generating hooks:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

