'use client';

import { useState } from 'react';

interface AdminProductChatProps {
  onProductGenerated?: (data: any) => void;
}

export default function AdminProductChat({ onProductGenerated }: AdminProductChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input) return;

    setLoading(true);

    try {
      const response = await fetch('/api/generate-product', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: `Create a product entry for this link: ${input}.` 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Send the data up to the parent page to fill the form
      if (onProductGenerated) {
        onProductGenerated(data);
      } else {
        alert("Success! Check console for data (Connect this to parent form to autofill).");
        console.log(data);
      }

    } catch (error: any) {
      console.error(error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ai-input-group">
      
      {/* 1. The Label */}
      <label className="text-sm font-semibold opacity-80 block text-[var(--admin-text)]">
        Product Source URL
      </label>

      {/* 2. The Styled Input Wrapper */}
      <div className="link-input-wrapper">
        <span className="link-input-icon">🔗</span>
        <input
          type="url"
          className="link-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste link here (e.g. https://selection-furniture.com/product/...)"
          required
        />
      </div>

      {/* 3. The Generate Button */}
      <div className="flex justify-end mt-2">
        <button 
          type="submit" 
          className="btn-generate"
          disabled={loading}
        >
          {loading ? '⏳ Scanning & Generating...' : 'Generate Product Details'}
        </button>
      </div>

    </form>
  );
}