import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * 1. DYNAMIC METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  const product = await (Product.findOne({ 
    $or: [{ id: id }, { _id: id }] 
  }).lean() as any);

  if (!product) {
    return { title: 'Product Not Found - Selection Furniture' };
  }

  const siteUrl = "https://selection-furniture.vercel.app";
  const firstImage = product.gallery?.[0] || '/assets/images/products/placeholder.webp';
  const absoluteImageUrl = firstImage.startsWith('http') 
    ? firstImage 
    : `${siteUrl}/${firstImage.replace(/^\.\//, '').replace(/^\//, '')}`;

  return {
    title: `${product.name} - Selection Furniture`,
    description: product.description || "Quality home decor from Selection Furniture",
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${siteUrl}/product/${id}`,
      siteName: 'Selection Furniture',
      images: [{ url: absoluteImageUrl }],
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
  const { id } = await params;
  await dbConnect();

  const product = await (Product.findOne({ 
    $or: [{ id: id }, { _id: id }] 
  }).lean() as any);

  if (!product) {
    notFound();
  }

  // Ensure data is serializable for the client component
  const serializableProduct = JSON.parse(JSON.stringify(product));

  return (
    <main className="product-container" style={{ padding: '40px 0', minHeight: '100vh' }}>
      <div className="container">
        <div className="showcase" style={{ display: 'flex', gap: '40px', background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          
          <div className="showcase-banner" style={{ flex: 1 }}>
            <img 
              src={serializableProduct.gallery?.[0] || '/assets/images/products/placeholder.webp'} 
              alt={serializableProduct.name} 
              style={{ width: '100%', borderRadius: '10px', objectFit: 'cover' }}
            />
          </div>

          <div className="showcase-content" style={{ flex: 1 }}>
            <h3 className="showcase-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#333' }}>
              {serializableProduct.name}
            </h3>
            
            <p className="showcase-desc" style={{ margin: '20px 0', color: '#777', lineHeight: '1.6' }}>
              {serializableProduct.description}
            </p>

            <div className="price-box" style={{ marginBottom: '25px' }}>
              <p className="price" style={{ fontSize: '1.8rem', color: 'var(--industrial-wood)', fontWeight: 800 }}>
                {serializableProduct.currency === 'USD' ? '$' : '£'} Call for Price
              </p>
            </div>

            <div style={{ padding: '20px 0', borderTop: '1px solid #eee', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '8px' }}><strong>SKU:</strong> {serializableProduct.id}</p>
              <p><strong>Category:</strong> {serializableProduct.categories?.join(' / ')}</p>
            </div>

            {serializableProduct.long_description && (
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Product Details:</h4>
                <div 
                  className="long-description-content"
                  style={{ color: '#555' }}
                  dangerouslySetInnerHTML={{ __html: serializableProduct.long_description }} 
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
