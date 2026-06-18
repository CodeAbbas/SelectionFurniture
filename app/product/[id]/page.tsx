import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductGallery from '../../components/product/ProductGallery';
import ProductClient from '../../components/product/ProductClient';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

type Props = {
  params: Promise<{ id: string }>;
};

interface ProductDocument {
  id?: string;
  _id?: string;
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

/* =========================================================
   DYNAMIC METADATA
========================================================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const finalQuery: any = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };
  const product = (await Product.findOne(finalQuery).lean()) as ProductDocument;

  if (!product) {
    return {
      title: 'Product Not Found - Selection Furniture',
    };
  }

  const siteUrl = 'https://selection-furniture.vercel.app';
  const firstImage =
    product.gallery?.[0] ||
    product.image ||
    '/assets/images/products/placeholder.webp';

  const absoluteImageUrl = firstImage.startsWith('http')
    ? firstImage
    : `${siteUrl}/${firstImage
        .replace(/^\.\//, '')
        .replace(/^\//, '')}`;

  return {
    title: `${product.name} - Selection Furniture`,
    description:
      product.description ||
      'Quality home decor from Selection Furniture',
    openGraph: {
      title: product.name,
      description:
        product.description ||
        'Quality home decor from Selection Furniture',
      url: `${siteUrl}/product/${id}`,
      siteName: 'Selection Furniture',
      images: [
        {
          url: absoluteImageUrl,
        },
      ],
      type: 'website',
    },
  };
}

/* =========================================================
   PRODUCT PAGE
========================================================= */
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  await dbConnect();

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  const finalQuery: any = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };
  const product = (await Product.findOne(finalQuery).lean()) as ProductDocument;

  if (!product) {
    notFound();
  }

  // Serialize product to plain object
  const serializableProduct = JSON.parse(JSON.stringify(product));

  // Fetch related products (same first category)
  let relatedProducts: any[] = [];
  const mainCategory = serializableProduct.categories?.[0];
  if (mainCategory) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const relatedRes = await fetch(
        `${baseUrl}/api/products?category=${encodeURIComponent(mainCategory)}&limit=4`,
        { cache: 'no-store' }
      );
      if (relatedRes.ok) {
        const data = await relatedRes.json();
        relatedProducts = data.filter((p: any) => p.id !== serializableProduct.id);
      }
    } catch (e) {
      console.warn('Failed to fetch related products', e);
    }
  }

  // Build breadcrumb
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(mainCategory ? [{ label: mainCategory, href: `/category?category=${encodeURIComponent(mainCategory)}` }] : []),
    ...(Array.isArray(serializableProduct.subcategories) && serializableProduct.subcategories.length
      ? [{ label: serializableProduct.subcategories[0], href: `/category?category=${encodeURIComponent(mainCategory)}&subcategory=${encodeURIComponent(serializableProduct.subcategories[0])}` }]
      : []),
    { label: serializableProduct.name, href: '#' },
  ];

  return (
    <main>
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
        {/* --- BREADCRUMB --- */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          {breadcrumbItems.map((item, index) => (
            <span key={index}>
              {index > 0 && <span style={{ margin: '0 6px' }}>/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span className="current">{item.label}</span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
            </span>
          ))}
        </nav>

        {/* --- PRODUCT GRID --- */}
        <div className="product-details-grid">
          {/* LEFT: GALLERY */}
          <div className="product-gallery-wrapper">
            <ProductGallery
              name={serializableProduct.name}
              gallery={serializableProduct.gallery}
              image={serializableProduct.image}
            />
          </div>

          {/* RIGHT: CLIENT COMPONENT with all interactivity */}
          <ProductClient
            product={serializableProduct}
            relatedProducts={relatedProducts}
          />
        </div>
      </div>
    </main>
  );
}