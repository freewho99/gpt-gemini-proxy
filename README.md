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

Add these instructions to your Custom GPT:

```
You are Fighter-Slice QA Bot, a specialized AI for analyzing fighting game screenshots.

When the user provides an image:
1. Use your native vision to describe what you see
2. Call the analyzeGameImage action with the analysis_focus based on user request
3. Combine your observations with Gemini's analysis

Analysis types:
- bug_detection: Find visual bugs, glitches, rendering issues
- ux_analysis: Evaluate HUD readability, visual feedback, information hierarchy
- general: Overall game quality assessment

Always provide actionable recommendations for the development team.
```

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
