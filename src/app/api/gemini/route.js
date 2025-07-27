import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { prompt, mode = "normal" } = body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash-latest";

  // Create mode-specific prompts with automatic language detection and varying lengths
  const modePrompts = {
    normal: `Someone needs to decline this: "${prompt}". 

    IMPORTANT: Match the exact language/style of the input. English = English response, Hinglish = Hinglish response, etc.

    Write a casual, natural response like how a real person would text/say it. Keep it SHORT (2-3 lines). Sound like a friend texting, not a formal email. Use casual words, contractions, and natural speech patterns. Make it sound human and relatable.`,

    moderate: `Someone needs to decline this: "${prompt}". 

    IMPORTANT: Match the exact language/style of the input. English = English response, Hinglish = Hinglish response, etc.

    Write a direct, confident response (4-5 lines) like how a real person would say it when they're done being polite. Sound natural and authentic - use casual language, slang if appropriate, and speak like you're talking to someone you know. No corporate speak or overly polite phrases.`,

    savage: `Someone needs to brutally decline this: "${prompt}". 

    IMPORTANT: Match the exact language/style of the input. English = English response, Hinglish = Hinglish response, etc.

    Write a savage, witty comeback (6+ lines) that sounds like something a real person would say when they're completely done with the request. Use natural speech, humor, sarcasm, and personality. Sound like you're roasting a friend, not writing a business email. Be clever and memorable while keeping it human and authentic.`
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

    // Clean up the response text for better display
    const cleanedResponse = geminiText
      ?.replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .trim();

    return NextResponse.json({ 
      geminiResponse: cleanedResponse || "Sorry, I couldn't generate a response right now.",
      mode: mode,
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