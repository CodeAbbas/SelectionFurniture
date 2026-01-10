'use client';

import React, { useState } from 'react';
import AdminProductChat from '../../components/AdminProductChat';

export default function AddProductPage() {
  const [productJson, setProductJson] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle copying JSON to clipboard
  const handleCopyJson = () => {
    if (productJson) {
      navigator.clipboard.writeText(JSON.stringify(productJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- SAVE FUNCTION ---
  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    
    // 1. Capture Form Data
    const formData = new FormData(e.currentTarget);
    
    // 2. Build the object (Frontend Logic)
    const finalProduct = {
      id: formData.get('id'),
      name: formData.get('name'),
      price: Number(formData.get('price')),
      currency: formData.get('currency'),
      rating: Number(formData.get('rating')),
      description: formData.get('description'),
      long_description: formData.get('long_description'),

      // Convert comma-separated strings back to Arrays
      categories: (formData.get('categories') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      subcategories: (formData.get('subcategories') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      
      // Convert newlines to Array for Gallery
      gallery: (formData.get('gallery') as string)?.split('\n').map(s => s.trim()).filter(Boolean),
      
      // Booleans
      is_new_arrival: formData.get('is_new_arrival') === 'on',
      is_best_seller: formData.get('is_best_seller') === 'on',
      
      // Defaults
      badges: [],
      actions: ["heart", "eye", "repeat", "bag"]
    };

    console.log("📤 Sending Product:", finalProduct);

    try {
      const response = await fetch('/api/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Success: Product saved to database!");
      } else {
        alert("❌ Error: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("❌ Network Error: Check console for details.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Add New Product</h1>
        <p className="admin-subtitle">AI Generator & Manager</p>
      </header>

      {/* --- SPLIT LAYOUT START --- */}
      <div className="admin-split-layout">
        
        {/* === LEFT COLUMN: AI & JSON === */}
        <div className="left-column">
          <section className="ai-section">
            <h2 className="text-lg font-bold mb-4 text-[var(--admin-text)] flex items-center gap-2">
              🤖 AI Generator
            </h2>
            <AdminProductChat onProductGenerated={(data) => setProductJson(data)} />
          </section>

          {productJson && (
            <div className="json-preview-box">
              <div className="json-header">
                <span className="json-title">JSON OUTPUT</span>
                <button onClick={handleCopyJson} className="btn-copy-sm">
                  {copied ? '✅ Copied!' : '📋 Copy JSON'}
                </button>
              </div>
              <pre className="json-content">
                {JSON.stringify(productJson, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN: MANUAL FORM === */}
        <div className="right-column">
          <section className="manual-form-section h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--admin-text)]">📝 Edit Details</h2>
              {productJson && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">
                  ⚡ Auto-filled
                </span>
              )}
            </div>
            
            {/* ATTACHED HANDLE SAVE HERE */}
            <form className="form-grid-wrapper" onSubmit={handleSave}>
              <div className="form-grid">
                
                {/* ID - Added Name="id" */}
                <div className="form-group">
                  <label className="form-label">ID / SKU</label>
                  <input 
                    name="id" 
                    type="text" 
                    className="form-input" 
                    defaultValue={productJson?.id || ''} 
                    placeholder="e.g. laguna-corner-sofa"
                    required
                  />
                </div>

                {/* Rating - Added Name="rating" */}
                <div className="form-group">
                  <label className="form-label">Rating (0-5)</label>
                  <input 
                    name="rating"
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input" 
                    defaultValue={productJson?.rating || 5} 
                  />
                </div>

                {/* Name - Added Name="name" */}
                <div className="form-group span-full">
                  <label className="form-label">Product Name</label>
                  <input 
                    name="name"
                    type="text" 
                    className="form-input" 
                    defaultValue={productJson?.name || ''} 
                    placeholder="Product Title"
                    required
                  />
                </div>

                {/* Price - Added Name="price" */}
                <div className="form-group">
                  <label className="form-label">Price (£)</label>
                  <input 
                    name="price"
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    defaultValue={productJson?.price || ''} 
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Currency - Added Name="currency" */}
                 <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select name="currency" className="form-input" defaultValue={productJson?.currency || 'GBP'}>
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Category - Added Name="categories" */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    name="categories"
                    type="text" 
                    className="form-input" 
                    defaultValue={Array.isArray(productJson?.categories) ? productJson.categories[0] : productJson?.categories || ''} 
                    placeholder="Main Category"
                  />
                </div>
                
                 {/* Subcategories - Added Name="subcategories" */}
                <div className="form-group">
                  <label className="form-label">Subcategories</label>
                  <input 
                    name="subcategories"
                    type="text" 
                    className="form-input" 
                    defaultValue={
                      Array.isArray(productJson?.subcategories) 
                        ? productJson.subcategories.join(', ') 
                        : (productJson?.subcategories || '')
                    } 
                    placeholder="Comma separated"
                  />
                </div>

                {/* Flags - Added Names */}
                <div className="form-group span-full flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      name="is_new_arrival"
                      type="checkbox" 
                      defaultChecked={productJson?.is_new_arrival} 
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-[var(--admin-text)]">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      name="is_best_seller"
                      type="checkbox" 
                      defaultChecked={productJson?.is_best_seller} 
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-[var(--admin-text)]">Best Seller</span>
                  </label>
                </div>
              </div>

              {/* Short Description - Added Name="description" */}
              <div className="form-group mt-4">
                <label className="form-label">Short Description (Summary)</label>
                <textarea 
                  name="description"
                  className="form-input" 
                  rows={3}
                  defaultValue={productJson?.description || ''}
                  placeholder="Brief overview..."
                ></textarea>
              </div>

              {/* Long Description - Added Name="long_description" */}
              <div className="form-group">
                <label className="form-label">Long Description (HTML)</label>
                <textarea 
                  name="long_description"
                  className="form-input" 
                  rows={6}
                  defaultValue={productJson?.long_description || ''}
                  placeholder="<p>Full details...</p>"
                ></textarea>
              </div>

              {/* Gallery - Added Name="gallery" */}
              <div className="form-group">
                <label className="form-label">Gallery Images (One URL per line)</label>
                <textarea 
                  name="gallery"
                  className="form-input font-mono text-sm" 
                  rows={5}
                  defaultValue={productJson?.gallery?.join('\n') || ''}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                ></textarea>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button type="submit" className="btn-save w-full" disabled={isSaving}>
                  {isSaving ? '⏳ Saving to DB...' : '💾 Save to Database'}
                </button>
              </div>
            </form>
          </section>
        </div>

      </div>

    </div>
  );
}