import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { prompt, mode = "normal" } = body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash-latest";

  // Create mode-specific prompts
  const modePrompts = {
    normal: `You are helping someone politely decline this request/situation: "${prompt}". Generate a professional, polite way they can say "no" to this situation. 

    Give them one clear response they can use to decline professionally while maintaining good relationships. Make it respectful but firm.`,

    moderate: `You are helping someone assertively decline this request/situation: "${prompt}". Generate a direct, confident way they can say "no" to this situation.

    Give them one clear response they can use to decline firmly without being apologetic. Make it assertive and clear about their boundaries.`,

    savage: `You are helping someone brutally decline this request/situation: "${prompt}". Generate a witty, savage way they can say "no" to this situation.

    Give them one memorable response they can use to decline in a funny, brutally honest way. Make it clever and unforgettable while still being somewhat professional.`
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