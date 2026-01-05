# GPT Gemini Vision Proxy

A simple Vercel/Next.js API that proxies ChatGPT Actions to Google Gemini Vision for analyzing fighting game screenshots.

## Architecture

```
ChatGPT (Custom GPT)
        ↓
  [Action Call]
        ↓
Vercel API Route (/api/gemini/analyze-image)
        ↓
Google Gemini Vision API
        ↓
  [Analysis Response]
        ↓
ChatGPT (displays results)
```

## Deployment

### 1. Deploy to Vercel

```bash
cd gpt-gemini-proxy
npm install
vercel
```

Or connect to GitHub and deploy automatically.

### 2. Set Environment Variable

In Vercel Dashboard → Project Settings → Environment Variables:

- **Name:** `GEMINI_API_KEY`
- **Value:** Your Google Gemini API key from https://aistudio.google.com/apikey

### 3. Configure Custom GPT

In GPT Builder (https://chatgpt.com/gpts/editor):

1. Go to **Configure** tab
2. Scroll to **Actions** → Click **Create new action**
3. Paste the contents of `openapi-schema.json`
4. Replace `YOUR-PROJECT` with your actual Vercel project URL
5. **Authentication:** None required (API key is server-side)

### 4. Update GPT Instructions

> ⚠️ **Important:** ChatGPT cannot convert images to base64 or unzip files. Use its **native vision** for direct image analysis.

Paste these instructions into your Custom GPT's Configure section:

```
You are Fighter-Slice QA Bot, specialized in analyzing fighting game screenshots.

IMPORTANT: Use your NATIVE VISION to analyze images directly. Do NOT try to call external APIs for image analysis - just look at the image yourself.

When the user uploads an image or ZIP:
1. If it's an image: Analyze it directly using your vision
2. If it's a ZIP: Tell the user to extract and upload the images directly

For each screenshot, evaluate:
- BUGS: Animation glitches, rendering issues, UI problems, visual artifacts
- UX: HUD readability, visual feedback clarity, information hierarchy
- OVERALL: Rate quality 1-10 with specific recommendations

Be specific and actionable. Format as a QA report.
```

> 💡 The Vercel API is still useful if someone manually provides base64 data, but for normal image uploads, the GPT should use its own eyes.

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

Test at http://localhost:3000/api/gemini/analyze-image

## API Reference

### POST /api/gemini/analyze-image

**Request:**

```json
{
  "image_base64": "base64-encoded-image",
  "analysis_focus": "bug_detection" | "ux_analysis" | "general"
}
```

**Response:**

```json
{
  "success": true,
  "analysis": "Detailed Gemini Vision analysis..."
}
```

## Usage in ChatGPT

1. Upload a screenshot to the Custom GPT
2. Say "Analyze this for bugs" or "Do a UX review"
3. The GPT will combine its vision with Gemini's analysis
