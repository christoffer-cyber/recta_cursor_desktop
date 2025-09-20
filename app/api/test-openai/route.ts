import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: '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',
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Du är en hjälpsam assistent." },
        { role: "user", content: "Säg hej på svenska." }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || 'Inget svar';
    
    return NextResponse.json({
      success: true,
      message: response,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error: unknown) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
