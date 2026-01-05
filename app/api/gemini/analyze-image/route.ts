import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_base64, analysis_focus } = body;

    if (!image_base64) {
      return NextResponse.json(
        { error: "image_base64 is required" },
        { status: 400 }
      );
    }

    // Build the analysis prompt based on focus type
    let prompt = "Analyze this fighting game image.";

    if (analysis_focus === "bug_detection") {
      prompt = `Analyze this fighting game screenshot for visual bugs and issues:

1. ANIMATION ISSUES:
   - Character pose problems (T-pose, clipping, wrong orientation)
   - Animation stuttering or freezing indicators
   - Unnatural character positions

2. RENDERING PROBLEMS:
   - Z-fighting (flickering surfaces)
   - Missing or broken textures
   - Lighting/shadow artifacts
   - Transparency issues

3. UI/HUD BUGS:
   - Overlapping UI elements
   - Cut-off or clipped text
   - Misaligned health bars or meters
   - Missing UI components

4. VISUAL GLITCHES:
   - Screen tearing
   - Artifacts or corruption
   - Unexpected visual elements

List each issue found with a severity rating (Critical/Major/Minor).
If no issues found, say "No visual bugs detected."`;
    } else if (analysis_focus === "ux_analysis") {
      prompt = `Evaluate this fighting game screenshot for UX quality:

1. HUD READABILITY (Score 1-10):
   - Are health bars clearly visible?
   - Is the super meter easy to read?
   - Are round indicators clear?
   - Can you tell which player is which?

2. VISUAL FEEDBACK (Score 1-10):
   - Are hit effects visible and impactful?
   - Are damage numbers readable?
   - Is there clear distinction between hit/block/whiff?

3. INFORMATION HIERARCHY (Score 1-10):
   - What draws your eye first? Is it the right thing?
   - Is critical info (health, meter) prominent?
   - Is there visual clutter?

4. AESTHETIC COHESION (Score 1-10):
   - Does the visual style feel unified?
   - Do UI elements match the game's theme?
   - Is there good color contrast?

Provide scores for each category and brief explanations.
End with an OVERALL UX SCORE (1-10).`;
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: image_base64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status}`, details: errorText },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();

    // Extract the text response from Gemini's structure
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated";

    return NextResponse.json({
      success: true,
      analysis: analysis,
      raw: data
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
