export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>GPT Gemini Vision Proxy</h1>
      <p>This API proxies image analysis requests from ChatGPT to Google Gemini Vision.</p>

      <h2>Endpoint</h2>
      <code>POST /api/gemini/analyze-image</code>

      <h2>Request Body</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
{`{
  "image_base64": "base64-encoded-image-data",
  "analysis_focus": "bug_detection" | "ux_analysis" | "general"
}`}
      </pre>

      <h2>Response</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
{`{
  "success": true,
  "analysis": "Detailed analysis from Gemini Vision..."
}`}
      </pre>
    </main>
  );
}
