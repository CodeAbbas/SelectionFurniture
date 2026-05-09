import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

type Props = {
  params: { id: string };
};

/**
 * 1. DYNAMIC METADATA (The fix for WhatsApp)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await dbConnect();
  const product = await Product.findOne({ 
  $or: [{ id: params.id }, { _id: params.id }] 
} as any).lean();
  

  if (!product) {
    return { title: 'Product Not Found - Selection Furniture' };
  }

  const siteUrl = "https://selection-furniture.vercel.app";
  const firstImage = product.gallery?.[0] || '/assets/images/products/placeholder.webp';
  const absoluteImageUrl = firstImage.startsWith('http') 
    ? firstImage 
    : `${siteUrl}/${firstImage.replace('./', '')}`;

  return {
    title: `${product.name} - Selection Furniture`,
    description: product.description || "Quality home decor from Selection Furniture",
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${siteUrl}/product/${product.id}`,
      siteName: 'Selection Furniture',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [absoluteImageUrl],
    },
  };
}

/**
 * 2. PRODUCT PAGE COMPONENT
 */
export default async function ProductPage({ params }: Props) {
  await dbConnect();
  const product = await Product.findOne({ 
  $or: [{ id: params.id }, { _id: params.id }] 
} as any).lean();

  if (!product) {
    notFound();
  }

  const serializableProduct = JSON.parse(JSON.stringify(product));

  return (
    <main className="product-container">
      <div className="container" style={{ flexDirection: 'column' }}>
        <div className="product-box" style={{ width: '100%', margin: 0 }}>
          <div className="product-featured">
            <div className="showcase-wrapper" style={{ overflow: 'visible' }}>
              <div className="showcase" style={{ display: 'flex', gap: '40px', padding: '30px' }}>
                
                <div className="showcase-banner" style={{ flex: 1 }}>
                  <img 
                    src={serializableProduct.gallery?.[0] || '/assets/images/products/placeholder.webp'} 
                    alt={serializableProduct.name} 
                    className="showcase-img"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                <div className="showcase-content" style={{ flex: 1 }}>
                  <h3 className="showcase-title" style={{ fontSize: '1.8rem', fontWeight: 600 }}>
                    {serializableProduct.name}
                  </h3>
                  
                  <p className="showcase-desc" style={{ margin: '20px 0', color: 'var(--sonic-silver)' }}>
                    {serializableProduct.description}
                  </p>

                  <div className="price-box">
                    <p className="price" style={{ fontSize: '1.5rem', color: 'var(--industrial-wood)', fontWeight: 700 }}>
                      {serializableProduct.currency === 'USD' ? '$' : '£'} Call for Price
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <p><strong>SKU:</strong> {serializableProduct.id}</p>
                    <p><strong>Category:</strong> {serializableProduct.categories?.join(' / ')}</p>
                  </div>

                  {serializableProduct.long_description && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>Product Details:</h4>
                      <div dangerouslySetInnerHTML={{ __html: serializableProduct.long_description }} />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
