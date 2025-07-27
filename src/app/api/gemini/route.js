import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { prompt, mode = "normal" } = body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const model = "gemini-1.5-flash-latest";

  // Create mode-specific prompts with automatic language detection and varying lengths
  const modePrompts = {
    normal: `You are helping someone politely decline this request/situation: "${prompt}". 

    IMPORTANT: Analyze the language and tone of the input text and respond in the EXACT same language/style. If they write in English, respond in English. If they write in Hinglish (like "mera dost party me bula rha h"), respond in Hinglish. Match their exact language mixing style.

    Generate a direct response they can send/say to the person asking. Keep it SHORT - only 2-3 lines maximum. Make it respectful but firm. This should be something they can copy-paste or say directly to decline the request.`,

    moderate: `You are helping someone assertively decline this request/situation: "${prompt}". 

    IMPORTANT: Analyze the language and tone of the input text and respond in the EXACT same language/style. If they write in English, respond in English. If they write in Hinglish (like "mera dost party me bula rha h"), respond in Hinglish. Match their exact language mixing style.

    Generate a direct response they can send/say to the person asking. Make it 4-5 lines - more detailed than normal mode. Be assertive and clear about boundaries. This should be something they can copy-paste or say directly to decline the request without being apologetic.`,

    savage: `You are helping someone brutally decline this request/situation: "${prompt}". 

    IMPORTANT: Analyze the language and tone of the input text and respond in the EXACT same language/style. If they write in English, respond in English. If they write in Hinglish (like "mera dost party me bula rha h"), respond in Hinglish. Match their exact language mixing style.

    Generate a direct response they can send/say to the person asking. Make it elaborate - 6 or more lines. Be brutally honest, witty, and memorable. This should be something they can copy-paste or say directly to decline the request in a savage but clever way. Don't talk ABOUT the situation, give them the actual words to say.`
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