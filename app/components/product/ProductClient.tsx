'use client';

import { useState, useEffect, useRef } from 'react';
import Toast from '../ui/Toast';
import ReviewSection from './ReviewSection';
import { useCartStore } from '../../../lib/cartStore';

interface Product {
  id?: string;
  name?: string;
  description?: string;
  long_description?: string;
  price?: number;
  original_price?: number;
  currency?: string;
  gallery?: string[];
  image?: string;
  categories?: string[];
  subcategories?: string | string[];
  rating?: number;
  badges?: Array<{ text: string; color: string; type: string }>;
  stock_status?: {
    sold: number;
    available: number;
  };
}

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

function formatCurrency(amount: number, currency: string = 'GBP') {
  const value = Number(amount).toFixed(2);
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  return `${symbol}${value}`;
}

function renderStars(rating: number = 0) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const IonIcon = 'ion-icon' as any;
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSticky, setIsSticky] = useState(false);

  const addToCartRef = useRef<HTMLDivElement>(null);

  // Wishlist
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      const list = JSON.parse(stored);
      setIsWishlisted(list.includes(product.id));
    }
  }, [product.id]);

  const toggleWishlist = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    let list: string[] = [];
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      list = JSON.parse(stored);
    }
    if (newState) {
      if (!list.includes(product.id)) {
        list.push(product.id);
      }
    } else {
      list = list.filter(id => id !== product.id);
    }
    localStorage.setItem('wishlist', JSON.stringify(list));
    setToastMessage(newState ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    setShowToast(true);
  };

  // Cart
  const handleAddToCart = () => {
    const image = product.gallery?.[0] || product.image || '/assets/images/products/placeholder.webp';
    addItem({
      productId: product.id || '',
      name: product.name || '',
      price: product.price || 0,
      currency: product.currency || 'GBP',
      quantity: quantity,
      image: image,
    });
    setToastMessage(`Added ${quantity} × ${product.name} to cart 🛒`);
    setShowToast(true);
  };

  // Sticky detection
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setIsSticky(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const mainCategory = product.categories?.[0] || 'Furniture';
  const subcategories = Array.isArray(product.subcategories)
    ? product.subcategories
    : product.subcategories
    ? [product.subcategories]
    : [];

  return (
    <>
      <Toast message={toastMessage} visible={showToast} onClose={() => setShowToast(false)} />

      <div className="product-details">
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="product-badges">
            {product.badges.map((badge, idx) => (
              <span
                key={idx}
                className={`showcase-badge ${badge.type || 'angle'} ${badge.color || 'eerie-black'}`}
                style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        <h1 className="product-title">{product.name}</h1>

        <div className="product-rating">
          <span className="stars">{renderStars(product.rating || 0)}</span>
          <span className="score">({(product.rating || 0).toFixed(1)})</span>
        </div>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        <div className="product-price-box">
          <span className="product-price">{formatCurrency(product.price || 0, product.currency)}</span>
          {product.original_price && (
            <span className="product-price-original">{formatCurrency(product.original_price, product.currency)}</span>
          )}
        </div>

        {product.stock_status && (
          <div className="stock-status-wrapper">
            <div className="stock-status-row">
              <p>Sold: <b>{product.stock_status.sold}</b></p>
              <p>Available: <b>{product.stock_status.available}</b></p>
            </div>
            <div className="stock-bar">
              <div
                className="stock-bar-fill"
                style={{
                  width: `${Math.round((product.stock_status.sold / (product.stock_status.sold + product.stock_status.available)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Add to Cart Row */}
        <div ref={addToCartRef}>
          <div className="add-to-cart-row">
            <div className="qty-wrapper">
              <button className="qty-btn" onClick={decreaseQty} aria-label="Decrease quantity">
                <IonIcon name="remove-outline" />
              </button>
              <input
                type="number"
                className="qty-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                aria-label="Quantity"
              />
              <button className="qty-btn" onClick={increaseQty} aria-label="Increase quantity">
                <IonIcon name="add-outline" />
              </button>
            </div>

            <button className="add-cart-btn" onClick={handleAddToCart}>
              <IonIcon name="cart-outline" />
              ADD TO CART
            </button>

            <button className="wishlist-btn" onClick={toggleWishlist} aria-label="Add to wishlist">
              <IonIcon
                name={isWishlisted ? 'heart' : 'heart-outline'}
                className={`heart-icon ${isWishlisted ? 'active' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="product-meta">
          <p><strong>Category:</strong> {mainCategory}</p>
          {subcategories.length > 0 && (
            <p><strong>Subcategories:</strong> {subcategories.join(', ')}</p>
          )}
          <p><strong>SKU:</strong> {product.id || 'N/A'}</p>
        </div>

        {/* Long Description */}
        {product.long_description && (
          <div className="long-description">
            <h4>Product Details</h4>
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: product.long_description }}
            />
          </div>
        )}

        {/* Reviews */}
        <ReviewSection productId={product.id || ''} />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="related-section">
            <h3 className="related-title">You May Also Like</h3>
            <div className="related-products-grid">
              {relatedProducts.map((rel) => {
                const img = rel.gallery?.[0] || rel.image || '/assets/images/products/placeholder.webp';
                return (
                  <a key={rel.id} href={`/product/${rel.id}`} className="related-card">
                    <img src={img} alt={rel.name} loading="lazy" />
                    <div className="related-name">{rel.name}</div>
                    <div className="related-price">
                      {formatCurrency(rel.price || 0, rel.currency)}
                      {rel.original_price && (
                        <del>{formatCurrency(rel.original_price, rel.currency)}</del>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bar */}
      <div className={`sticky-cart-bar ${isSticky ? 'visible' : ''}`}>
        <div>
          <span className="product-name">{product.name}</span>
          <span className="product-price">{formatCurrency(product.price || 0, product.currency)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="qty-mini">
            <button onClick={decreaseQty}><IonIcon name="remove-outline" /></button>
            <span>{quantity}</span>
            <button onClick={increaseQty}><IonIcon name="add-outline" /></button>
          </div>
          <button className="add-btn" onClick={handleAddToCart}>
            <IonIcon name="cart-outline" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </>
  );
}