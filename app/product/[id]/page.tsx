import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductGallery from '../../components/product/ProductGallery';
import mongoose from 'mongoose';

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
  stock_status?: {
    sold: number;
    available: number;
  };
}

/* =========================================================
   DYNAMIC METADATA
========================================================= */
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  await dbConnect();

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

  const finalQuery = isValidObjectId
    ? { $or: [{ id }, { _id: id }] }
    : { id };

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

  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

  const finalQuery = isValidObjectId
    ? { $or: [{ id }, { _id: id }] }
    : { id };

  const product = (await Product.findOne(finalQuery).lean()) as ProductDocument;

  if (!product) {
    notFound();
  }

  const serializableProduct = JSON.parse(JSON.stringify(product));

  const rawImage =
    serializableProduct.gallery?.[0] ||
    serializableProduct.image ||
    '/assets/images/products/placeholder.webp';
const cleanImageSrc = rawImage.startsWith('http')
  ? rawImage
  : rawImage.startsWith('./')
  ? rawImage.substring(1)
  : rawImage.startsWith('/')
  ? rawImage
  : `/${rawImage}`;
  

  const currencySymbol =
    serializableProduct.currency === 'USD'
      ? '$'
      : serializableProduct.currency === 'EUR'
      ? '€'
      : '£';

  let stockPercentage = 0;

  if (
    serializableProduct.stock_status &&
    serializableProduct.stock_status.available > 0
  ) {
    const total =
      serializableProduct.stock_status.sold +
      serializableProduct.stock_status.available;

    stockPercentage = Math.round(
      (serializableProduct.stock_status.sold / total) * 100
    );
  }

  return (
    <>
      <main>
        <div className="product-container">
          <div
            className="container"
            style={{ flexDirection: 'column' }}
          >
            {/* PRODUCT BOX */}
            <div
              className="product-box"
              style={{ width: '100%', margin: 0 }}
            >
              <div className="product-featured">
                <div
                  className="showcase-wrapper"
                  style={{ overflow: 'visible' }}
                >
                  <div
                    className="showcase-container"
                    style={{
                      minWidth: '100%',
                      padding: 0,
                      border: 'none',
                      marginRight: 0,
                    }}
                  >
                    {/* MAIN PRODUCT CARD */}
                    <div
                      className="showcase"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '40px',
                        border: '1px solid var(--cultured)',
                        padding: '30px',
                        borderRadius: 'var(--border-radius-md)',
                        background: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* PRODUCT IMAGE */}
                      <ProductGallery
  name={serializableProduct.name}
  gallery={serializableProduct.gallery}
  image={serializableProduct.image}
/>

                      {/* PRODUCT CONTENT */}
                      <div
                        className="showcase-content"
                        style={{
                          flex: 1,
                          minWidth: '300px',
                          marginTop: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        {/* RATING */}
                        <div
                          className="showcase-rating"
                          style={{
                            marginBottom: '15px',
                            display: 'flex',
                            gap: '2px',
                          }}
                        >
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                          <ion-icon name="star"></ion-icon>
                        </div>

                        {/* TITLE */}
                        <h3
                          className="showcase-title"
                          style={{
                            fontSize: '1.4rem',
                            marginBottom: '10px',
                            whiteSpace: 'normal',
                            overflow: 'visible',
                            fontWeight: 600,
                          }}
                        >
                          <a
                            href="#"
                            style={{
                              color: 'var(--eerie-black)',
                            }}
                          >
                            {serializableProduct.name}
                          </a>
                        </h3>

                        {/* DESCRIPTION */}
                        <p
                          className="showcase-desc"
                          style={{
                            marginBottom: '25px',
                            lineHeight: 1.6,
                            color: 'var(--sonic-silver)',
                            fontSize: '0.9rem',
                          }}
                        >
                          {serializableProduct.description}
                        </p>

                        {/* PRICE */}
                        <div
                          className="price-box"
                          style={{ marginBottom: '25px' }}
                        >
                          <p
                            className="price"
                            style={{
                              fontSize: '1.5rem',
                              color: 'var(--industrial-wood)',
                              fontWeight: 700,
                            }}
                          >
                            {currencySymbol}
                            {serializableProduct.price
                              ? Number(
                                  serializableProduct.price
                                ).toFixed(2)
                              : 'Call for Price'}
                          </p>

                          {serializableProduct.original_price && (
                            <del
                              style={{
                                fontSize: '1rem',
                                color: 'var(--sonic-silver)',
                                marginLeft: '10px',
                              }}
                            >
                              {currencySymbol}
                              {Number(
                                serializableProduct.original_price
                              ).toFixed(2)}
                            </del>
                          )}
                        </div>

                        {/* STOCK STATUS */}
                        {serializableProduct.stock_status && (
                          <div
                            style={{
                              marginBottom: '25px',
                              padding: '15px',
                              background: 'var(--cultured)',
                              borderRadius: '8px',
                            }}
                          >
                            <div className="showcase-status">
                              <div
                                className="wrapper"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '8px',
                                }}
                              >
                                <p>
                                  Sold:{' '}
                                  <b>
                                    {
                                      serializableProduct.stock_status
                                        .sold
                                    }
                                  </b>
                                </p>

                                <p>
                                  Available:{' '}
                                  <b>
                                    {
                                      serializableProduct.stock_status
                                        .available
                                    }
                                  </b>
                                </p>
                              </div>

                              <div
                                className="showcase-status-bar"
                                style={{
                                  background: '#ddd',
                                  height: '8px',
                                  borderRadius: '4px',
                                  position: 'relative',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${stockPercentage}%`,
                                    background:
                                      'var(--industrial-wood)',
                                    borderRadius: '4px',
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ACTION BUTTONS */}
                        <div
                          className="showcase-actions"
                          style={{
                            position: 'relative',
                            right: 'auto',
                            top: 'auto',
                            transform: 'none',
                            display: 'flex',
                            gap: '15px',
                            marginBottom: '30px',
                          }}
                        >
                          <button
                            className="add-cart-btn"
                            style={{
                              flex: 2,
                              padding: '12px',
                              fontSize: '0.9rem',
                              marginBottom: 0,
                            }}
                          >
                            ADD TO CART
                          </button>

                          <button
                            className="btn-action"
                            style={{
                              flex: 0.5,
                              background: 'var(--white)',
                              border:
                                '1px solid var(--cultured)',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ion-icon
                              name="heart-outline"
                              style={{
                                fontSize: '1.5rem',
                              }}
                            ></ion-icon>
                          </button>
                        </div>

                        {/* CATEGORY + SKU */}
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--sonic-silver)',
                            borderTop:
                              '1px solid var(--cultured)',
                            paddingTop: '20px',
                          }}
                        >
                          <p style={{ marginBottom: '5px' }}>
                            <strong>Category:</strong>{' '}
                            <span
                              style={{
                                color: 'var(--eerie-black)',
                              }}
                            >
                              {serializableProduct.categories?.join(
                                ' / '
                              ) || 'Furniture'}
                            </span>
                          </p>

                          <p>
                            <strong>SKU:</strong>{' '}
                            <span>
                              {serializableProduct.id || 'N/A'}
                            </span>
                          </p>
                        </div>

                        {/* LONG DESCRIPTION */}
                        {serializableProduct.long_description && (
                          <div
                            style={{
                              marginTop: '20px',
                              paddingTop: '20px',
                              borderTop:
                                '1px solid var(--cultured)',
                            }}
                          >
                            <h4
                              style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: 'var(--eerie-black)',
                                marginBottom: '10px',
                              }}
                            >
                              Product Details:
                            </h4>

                            <div
                              style={{
                                fontSize: '0.9rem',
                                color: 'var(--sonic-silver)',
                                lineHeight: 1.8,
                              }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  serializableProduct.long_description,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YOU MAY ALSO LIKE */}
            <div
              className="product-minimal"
              style={{ marginTop: '50px' }}
            >
              <h2 className="title">You May Also Like</h2>

              <div
                className="product-showcase"
                style={{
                  width: '100%',
                  minWidth: '100%',
                }}
              >
                <div
                  className="showcase-wrapper has-scrollbar"
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '15px',
                    paddingBottom: '15px',
                  }}
                >
                  {/* Add related products here later */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}