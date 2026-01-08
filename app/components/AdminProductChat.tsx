'use client';

import { useState } from 'react';

export default function AdminProductChat() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Inside app/components/AdminProductChat.tsx

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-product', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: `Create a product entry for this link: ${input}.` 
        }),
      });
      
      // 1. Check if the server is actually happy
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      // 2. Only THEN try to parse JSON
      const data = await response.json();
      setResult(data);

    } catch (error: any) {
      console.error(error);
      alert(`Failed: ${error.message}`); // Show alert so you know what happened
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">AI Product Generator</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded border-gray-300"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste product link (Alba Beds / SlidingWardrobes4U)..."
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Scraping & Generating...' : 'Generate JSON'}
        </button>
      </form>

      {result && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Generated JSON:</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}