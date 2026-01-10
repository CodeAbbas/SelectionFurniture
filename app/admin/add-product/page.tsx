'use client';

import React, { useState } from 'react';
import AdminProductChat from '../../components/AdminProductChat';

export default function AddProductPage() {
  const [productJson, setProductJson] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Function to handle copying JSON to clipboard
  const handleCopyJson = () => {
    if (productJson) {
      navigator.clipboard.writeText(JSON.stringify(productJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          
          {/* 1. AI Input Section */}
          <section className="ai-section">
            <h2 className="text-lg font-bold mb-4 text-[var(--admin-text)] flex items-center gap-2">
              AI Generator
            </h2>
            <AdminProductChat onProductGenerated={(data) => setProductJson(data)} />
          </section>

          {/* 2. JSON Preview Section */}
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
            
            <form className="form-grid-wrapper" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                
                {/* ID (Unique Identifier) */}
                <div className="form-group">
                  <label className="form-label">ID / SKU</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={productJson?.id || ''} 
                    placeholder="e.g. laguna-corner-sofa"
                  />
                </div>

                {/* Rating */}
                <div className="form-group">
                  <label className="form-label">Rating (0-5)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input" 
                    defaultValue={productJson?.rating || 5} 
                  />
                </div>

                {/* Name */}
                <div className="form-group span-full">
                  <label className="form-label">Product Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={productJson?.name || ''} 
                    placeholder="Product Title"
                  />
                </div>

                {/* Price */}
                <div className="form-group">
                  <label className="form-label">Price (£)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    defaultValue={productJson?.price || ''} 
                    placeholder="0.00"
                  />
                </div>

                {/* Currency */}
                 <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input" defaultValue={productJson?.currency || 'GBP'}>
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={Array.isArray(productJson?.categories) ? productJson.categories[0] : productJson?.categories || ''} 
                    placeholder="Main Category"
                  />
                </div>
                
                 {/* Subcategories (FIXED: Checks for Array vs String) */}
                <div className="form-group">
                  <label className="form-label">Subcategories</label>
                  <input 
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

                {/* Flags (Checkboxes) */}
                <div className="form-group span-full flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={productJson?.is_new_arrival} 
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-[var(--admin-text)]">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={productJson?.is_best_seller} 
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-[var(--admin-text)]">Best Seller</span>
                  </label>
                </div>
              </div>

              {/* Short Description */}
              <div className="form-group mt-4">
                <label className="form-label">Short Description (Summary)</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  defaultValue={productJson?.description || ''}
                  placeholder="Brief overview..."
                ></textarea>
              </div>

              {/* Long Description */}
              <div className="form-group">
                <label className="form-label">Long Description (HTML)</label>
                <textarea 
                  className="form-input" 
                  rows={6}
                  defaultValue={productJson?.long_description || ''}
                  placeholder="<p>Full details...</p>"
                ></textarea>
              </div>

              {/* Gallery URLs */}
              <div className="form-group">
                <label className="form-label">Gallery Images (One URL per line)</label>
                <textarea 
                  className="form-input font-mono text-sm" 
                  rows={5}
                  defaultValue={productJson?.gallery?.join('\n') || ''}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                ></textarea>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button className="btn-save w-full">💾 Save to Database</button>
              </div>
            </form>
          </section>
        </div>

      </div>

    </div>
  );
}