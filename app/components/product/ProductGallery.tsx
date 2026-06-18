'use client';

import { useState, useEffect } from 'react';

interface Props {
  name: string;
  gallery?: string[];
  image?: string;
}

function normalizeImage(src?: string): string {
  if (!src) return '/assets/images/products/placeholder.webp';
  if (src.startsWith('http')) return src;
  if (src.startsWith('./')) return src.substring(1);
  if (src.startsWith('/')) return src;
  return `/${src}`;
}

export default function ProductGallery({ name, gallery, image }: Props) {
  // Build image list
  const images =
    gallery && gallery.length > 0
      ? gallery
      : image
      ? [image]
      : ['/assets/images/products/placeholder.webp'];

  const normalizedImages = images.map(normalizeImage);
  const [selectedImage, setSelectedImage] = useState(normalizedImages[0]);

  // Reset when product changes
  useEffect(() => {
    setSelectedImage(normalizedImages[0]);
  }, [images.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleThumbClick = (src: string) => {
    setSelectedImage(src);
  };

  return (
    <div className="product-gallery">
      {/* Main image with fixed aspect ratio */}
      <div className="gallery-main">
        <img
          src={selectedImage}
          alt={name}
          className="gallery-main-img"
          loading="eager"
        />
      </div>

      {/* Thumbnails */}
      {normalizedImages.length > 1 && (
        <div className="gallery-thumbnails">
          {normalizedImages.map((src, index) => (
            <button
              key={index}
              className={`gallery-thumbnail ${
                selectedImage === src ? 'active' : ''
              }`}
              onClick={() => handleThumbClick(src)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={src} alt={`${name} thumbnail ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}