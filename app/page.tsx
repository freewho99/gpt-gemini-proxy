'use client';

import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string>('bug_detection');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage(base64);
      setAnalysis('');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis('');

    try {
      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: image,
          analysis_focus: focus,
        }),
      });

      const data = await res.json();
      setAnalysis(data.analysis || data.error || 'No response');
    } catch (err) {
      setAnalysis('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui',
      maxWidth: '800px',
      margin: '0 auto',
      background: '#0a0a0a',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <h1 style={{ color: '#f59e0b' }}>🎮 Fighter-Slice Vision Analyzer</h1>
      <p style={{ color: '#888' }}>Upload a game screenshot for AI-powered QA analysis</p>

      <div style={{ marginTop: '2rem' }}>
        <label style={{
          display: 'block',
          padding: '2rem',
          border: '2px dashed #333',
          borderRadius: '12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#111'
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {image ? '✅ Image loaded - Click to change' : '📁 Click to upload screenshot'}
        </label>
      </div>

      {image && (
        <div style={{ marginTop: '1rem' }}>
          <img
            src={`data:image/png;base64,${image}`}
            alt="Preview"
            style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #333' }}
          />
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: '#222',
            color: '#fff',
            border: '1px solid #333',
            fontSize: '1rem'
          }}
        >
          <option value="bug_detection">🐛 Bug Detection</option>
          <option value="ux_analysis">🎨 UX Analysis</option>
          <option value="general">📋 General QA</option>
        </select>

        <button
          onClick={analyzeImage}
          disabled={!image || loading}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            background: image && !loading ? '#f59e0b' : '#333',
            color: image && !loading ? '#000' : '#666',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: image && !loading ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
        </button>
      </div>

      {analysis && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#111',
          borderRadius: '12px',
          border: '1px solid #333',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}>
          <h3 style={{ color: '#f59e0b', marginTop: 0 }}>📊 Analysis Results</h3>
          {analysis}
        </div>
      )}

      <footer style={{ marginTop: '3rem', color: '#555', fontSize: '0.875rem' }}>
        Powered by Google Gemini Vision • Built for RoninOS
      </footer>
    </main>
  );
}
