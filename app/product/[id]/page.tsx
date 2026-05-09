import { Metadata } from 'next';
import { notFound } from 'next/navigation';
[span_2](start_span)import dbConnect from '@/lib/mongodb';[span_2](end_span)
[span_3](start_span)import Product from '@/models/Product';[span_3](end_span)

type Props = {
  params: { id: string };
};

/**
 * 1. DYNAMIC METADATA (The fix for WhatsApp)
 * This function runs on the server. Crawlers see the result of this
 * before the page even loads.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  [span_4](start_span)[span_5](start_span)await dbConnect();[span_4](end_span)[span_5](end_span)
  
  // Find product by the 'id' field (SKU) or MongoDB _id
  const product = await Product.findOne({ 
    $or: [{ id: params.id }, { _id: params.id }] 
  [span_6](start_span)[span_7](start_span)}).lean();[span_6](end_span)[span_7](end_span)

  if (!product) {
    return { title: 'Product Not Found - Selection Furniture' };
  }

  const siteUrl = "https://selection-furniture.vercel.app";
  
  // Ensure we have an absolute URL for the preview image
  const firstImage = product.gallery?.[0] || [span_8](start_span)[span_9](start_span)'/assets/images/products/placeholder.webp';[span_8](end_span)[span_9](end_span)
  const absoluteImageUrl = firstImage.startsWith('http') 
    ? firstImage 
    [span_10](start_span): `${siteUrl}/${firstImage.replace('./', '')}`;[span_10](end_span)

  return {
    [span_11](start_span)[span_12](start_span)title: `${product.name} - Selection Furniture`,[span_11](end_span)[span_12](end_span)
    description: product.description || [span_13](start_span)[span_14](start_span)"Quality home decor from Selection Furniture",[span_13](end_span)[span_14](end_span)
    openGraph: {
      [span_15](start_span)[span_16](start_span)title: product.name,[span_15](end_span)[span_16](end_span)
      description: product.description,
      [span_17](start_span)url: `${siteUrl}/product/${product.id}`,[span_17](end_span)
      siteName: 'Selection Furniture',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      [span_18](start_span)type: 'website',[span_18](end_span)
    },
    twitter: {
      [span_19](start_span)card: 'summary_large_image',[span_19](end_span)
      title: product.name,
      description: product.description,
      [span_20](start_span)images: [absoluteImageUrl],[span_20](end_span)
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
  }).lean();

  if (!product) {
    notFound();
  }

  // Convert MongoDB decimal/object types to plain JS for the client if necessary
  const serializableProduct = JSON.parse(JSON.stringify(product));

  return (
    <main className="product-container">
      <div className="container" style={{ flexDirection: 'column' }}>
        <div className="product-box" style={{ width: '100%', margin: 0 }}>
          <div className="product-featured">
            <div className="showcase-wrapper" style={{ overflow: 'visible' }}>
              <div className="showcase" style={{ display: 'flex', gap: '40px', padding: '30px' }}>
                
                {/* Product Images */}
                <div className="showcase-banner" style={{ flex: 1 }}>
                  <img 
                    src={serializableProduct.gallery?.[0] || '/assets/images/products/placeholder.webp'} 
                    alt={serializableProduct.name} 
                    className="showcase-img"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                {/* Product Info */}
                <div className="showcase-content" style={{ flex: 1 }}>
                  <h3 className="showcase-title" style={{ fontSize: '1.8rem', fontWeight: 600 }}>
                    [span_21](start_span){serializableProduct.name}[span_21](end_span)
                  </h3>
                  
                  <p className="showcase-desc" style={{ margin: '20px 0', color: 'var(--sonic-silver)' }}>
                    [span_22](start_span){serializableProduct.description}[span_22](end_span)
                  </p>

                  <div className="price-box">
                    <p className="price" style={{ fontSize: '1.5rem', color: 'var(--industrial-wood)', fontWeight: 700 }}>
                      {serializableProduct.currency === 'USD' ? [span_23](start_span)[span_24](start_span)'$' : '£'} Call for Price[span_23](end_span)[span_24](end_span)
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    [span_25](start_span)<p><strong>SKU:</strong> {serializableProduct.id}</p>[span_25](end_span)
                    [span_26](start_span)<p><strong>Category:</strong> {serializableProduct.categories?.join(' / ')}</p>[span_26](end_span)
                  </div>

                  {serializableProduct.long_description && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>Product Details:</h4>
                      [span_27](start_span)<div dangerouslySetInnerHTML={{ __html: serializableProduct.long_description }} />[span_27](end_span)
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
