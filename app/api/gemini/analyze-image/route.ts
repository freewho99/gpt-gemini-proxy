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
      prompt = `You are a QA bot trained on AAA fighting game standards (Tekken 8, Street Fighter 6, Guilty Gear Strive).

Analyze this screenshot using the Frame Data Architecture:
[STARTUP] → [ACTIVE] → [RECOVERY] → [NEUTRAL]

=== ANIMATION BUG PATTERNS ===
Check for these specific issues:

1. T-POSE SNAP
   - Skeleton reset during transition
   - Character suddenly in default pose
   - Severity: CRITICAL

2. FOOT SLIDING
   - Movement doesn't match ground contact
   - Character glides instead of steps
   - Severity: MAJOR

3. CLIPPING
   - Body parts pass through each other
   - Limbs through torso/head
   - Severity: MAJOR

4. JITTER
   - Rapid oscillation in pose
   - Vibrating/shaking character
   - Severity: MINOR

5. POP
   - Instant position change (no tween)
   - Sudden jump between states
   - Severity: MAJOR

=== TIMING BUG PATTERNS ===

6. DESYNC
   - Audio/visual mismatch
   - Effects before/after action
   - Severity: MAJOR

7. EARLY TRIGGER
   - Effect appears before action completes
   - Hit spark before contact
   - Severity: MINOR

8. LATE CANCEL
   - Recovery phase too long
   - Stuck in animation
   - Severity: MAJOR

9. FROZEN FRAME
   - Animation hangs/pauses
   - Character stuck mid-pose
   - Severity: CRITICAL

=== VISUAL BUG PATTERNS ===

10. Z-FIGHTING
    - Flickering surfaces
    - Two surfaces competing
    - Severity: MINOR

11. TEXTURE TEAR
    - Visible seams on model
    - UV mapping errors
    - Severity: MINOR

12. LOD POP
    - Quality swap visible
    - Detail suddenly changes
    - Severity: MINOR

13. SHADOW DISCONNECT
    - Shadow in wrong position
    - Shadow doesn't match pose
    - Severity: MINOR

=== OUTPUT FORMAT ===

For each issue found, report:
- BUG TYPE: [Name from list above]
- SEVERITY: CRITICAL / MAJOR / MINOR
- LOCATION: Where in frame (e.g., "P1 left arm", "background", "HUD")
- EVIDENCE: What you see that indicates this bug

If animation appears correct, note:
- Which phase the character is in (Startup/Active/Recovery/Neutral)
- Whether feedback matches state (hit effects, block flash, etc.)

End with: "BUGS FOUND: [count]" or "NO BUGS DETECTED - Animation quality: [1-10]"`;
    } else if (analysis_focus === "ux_analysis") {
      prompt = `You are a QA bot trained on AAA fighting game UX standards.

Use this weighted scoring rubric (based on Tekken 8, SF6, GGST):

=== QA SCORING RUBRIC ===

1. FRAME FLUIDITY (Weight: 25%)
   Score 1-10:
   - Smooth anticipation poses in startup
   - Clear hit extension in active frames
   - Natural return to stance in recovery
   - Idle has breathing/weight shift (not stiff)

   Bug indicators: Instant snap, missing frames, T-pose, frozen pose

2. HIT FEEDBACK CLARITY (Weight: 25%)
   Score 1-10:
   - Impact Effects: Sparks, splashes, screen flash visible?
   - Character Reaction: Stagger, knockback, launch appropriate?
   - Camera Response: Shake, zoom, slow-mo on big hits?
   - Audio Sync: Can you tell hit vs block vs whiff?

   Reference:
   - Normal Hit = White spark + thud
   - Counter Hit = Red spark + slow-mo + louder crack
   - Block = Blue shield + pushback + metallic clang
   - Whiff = No effect, whoosh only

   Bug indicators: Hit effect but no damage, reaction before hit, no visual difference

3. STATE TRANSITIONS (Weight: 20%)
   Score 1-10:
   - No visual "pop" between states
   - Weight transfer feels natural
   - Momentum carries through
   - Blending frames visible (not hard cuts)

   States: STANDING ↔ CROUCHING ↔ JUMPING → ATTACKING → HIT STUN → KNOCKDOWN → WAKE-UP → NEUTRAL

4. HUD RESPONSIVENESS (Weight: 15%)
   Score 1-10:
   - Health Bar: Instant white tick + delayed red drain?
   - Low health pulse/glow effect?
   - Meter fills with sparkle, full meter flashes?
   - Timer countdown consistent, final 10s urgent?

   Bug indicators: Health not updating, meter stuck, timer freeze

5. ENVIRONMENTAL POLISH (Weight: 15%)
   Score 1-10:
   - Wall splat has unique animation + bounce?
   - Dust/particles on movement?
   - Stage-appropriate effects (sparks on metal, water splashes)?
   - Background reacts to action?

=== OUTPUT FORMAT ===

FRAME FLUIDITY: [X]/10 (Weight: 25%)
[Brief explanation]

HIT FEEDBACK CLARITY: [X]/10 (Weight: 25%)
[Brief explanation]

STATE TRANSITIONS: [X]/10 (Weight: 20%)
[Brief explanation]

HUD RESPONSIVENESS: [X]/10 (Weight: 15%)
[Brief explanation]

ENVIRONMENTAL POLISH: [X]/10 (Weight: 15%)
[Brief explanation]

---
WEIGHTED TOTAL: [Calculate: (F×0.25 + H×0.25 + S×0.20 + U×0.15 + E×0.15)]/10

SEVERITY CLASSIFICATION:
- 9-10: AAA Quality - Ship it
- 7-8: Solid - Minor polish needed
- 5-6: Passable - Notable issues
- 3-4: Rough - Needs work
- 1-2: Broken - Blocker bugs

VERDICT: [Classification] - [One sentence summary]`;
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
