'use client';

import { useState } from 'react';

interface Props {
  name: string;
  gallery?: string[];
  image?: string;
}

function normalizeImage(src?: string) {
  if (!src) {
    return '/assets/images/products/placeholder.webp';
  }

  if (src.startsWith('http')) {
    return src;
  }

  if (src.startsWith('./')) {
    return src.substring(1);
  }

  if (src.startsWith('/')) {
    return src;
  }

  return `/${src}`;
}

export default function ProductGallery({
  name,
  gallery,
  image,
}: Props) {
  const images =
    gallery && gallery.length > 0
      ? gallery
      : image
      ? [image]
      : ['/assets/images/products/placeholder.webp'];

  const [selectedImage, setSelectedImage] = useState(
    normalizeImage(images[0])
  );

  return (
    <div
      className="showcase-banner"
      style={{
        flex: 1,
        minWidth: '300px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--border-radius-md)',
      }}
    >
      {/* MAIN IMAGE */}
      <img
        src={selectedImage}
        alt={name}
        className="showcase-img"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
        }}
      />

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            overflowX: 'auto',
            paddingBottom: '5px',
          }}
        >
          {images.map((imgSrc, index) => {
            const cleanThumb = normalizeImage(imgSrc);

            return (
              <img
                key={index}
                src={cleanThumb}
                alt={`${name} thumbnail ${index + 1}`}
                onClick={() => setSelectedImage(cleanThumb)}
                style={{
                  width: '70px',
                  height: '70px',
                  objectFit: 'cover',
                  borderRadius: '5px',
                  border:
                    selectedImage === cleanThumb
                      ? '2px solid var(--industrial-wood)'
                      : '1px solid var(--cultured)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}