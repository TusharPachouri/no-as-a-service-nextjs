import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { prompt, mode = "normal" } = body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash-latest";

  // Mode-specific prompts for "Decline-as-a-Service"
  const modePrompts = {
    normal: `The user described this situation: "${prompt}".
They want a friendly, polite way to say "no" in this situation.

Your task: Write a short, casual reply (2-3 lines) like how a real person would text a friend.
- Match the language/style of the input (English, Hinglish, etc.).
- Keep it light, relatable, and warm — no corporate jargon, no overly formal tone.
- Make it sound natural and human.`,

    moderate: `The user described this situation: "${prompt}".
They want a confident, clear way to say "no" in this situation.

Your task: Write a firm but polite reply (4-5 lines) like you're talking to someone you know when you’re done being overly nice.
- Match the language/style of the input (English, Hinglish, etc.).
- Keep it natural, direct, and easy to understand — you can add a bit of edge or slang if it fits.
- No robotic or formal-sounding phrases.`,

    savage: `The user described this situation: "${prompt}".
They want a bold, witty way to say "no" in this situation.

Your task: Write a savage, clever comeback (6+ lines) like something you'd say when you’ve had enough.
- Match the language/style of the input (English, Hinglish, etc.).
- Use humor, sarcasm, or playful roasting — but keep it conversational and human.
- Make it sharp and memorable, like you’re teasing or roasting a friend, not writing a memo.`
  };

  const selectedPrompt = modePrompts[mode] || modePrompts.normal;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: selectedPrompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch from Gemini API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Clean up Gemini’s markdown formatting
    const cleanedResponse = geminiText
      ?.replace(/\*\*(.*?)\*\*/g, "$1") // remove bold
      .replace(/\*(.*?)\*/g, "$1") // remove italic
      .trim();

    return NextResponse.json({
      geminiResponse: cleanedResponse || "Sorry, I couldn't generate a response right now.",
      mode,
      originalPrompt: prompt
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
