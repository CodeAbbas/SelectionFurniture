document.addEventListener("DOMContentLoaded", async function() {
  
  // 1. Get Product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  // UI Elements
  const container = document.querySelector('.product-container');

  try {
    // 2. FETCH DATA FROM MONGODB
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error("Failed to load products");
    
    const rawData = await response.json();

    // 3. Normalize Data
    const products = rawData.map(p => ({
      ...p,
      id: p.id || p._id,
      price: Number(p.price),
      original_price: p.original_price ? Number(p.original_price) : null,
      gallery: p.gallery || [],
      categories: Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : [])
    }));

    // 4. Find the specific product
    const product = products.find(p => p.id === productId || p._id === productId);
    if (product) {
      document.title = `${product.name} - Selection Furniture`;
      
      // Update OG Tags dynamically
      // Note: Ensure these tags exist in your product.html <head> first
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      if (ogTitle) ogTitle.setAttribute("content", product.name);
      if (ogDesc) ogDesc.setAttribute("content", product.description || "Quality furniture from Selection Furniture");
      
      const shareImage = (product.gallery && product.gallery.length > 0) 
        ? product.gallery[0] 
        [span_1](start_span)[span_2](start_span): './assets/images/products/placeholder.webp';[span_1](end_span)[span_2](end_span)
        
      if (ogImage) {
        // WhatsApp often requires an absolute URL (starting with https://)
        const absoluteImageUrl = shareImage.startsWith('http') 
          ? shareImage 
          : `${window.location.origin}/${shareImage.replace('./', '')}`;
        ogImage.setAttribute("content", absoluteImageUrl);
      }
    }
    // Handle Product Not Found
    if (!product) {
      container.innerHTML =
        '<div class="container" style="text-align:center; padding:50px;"><h2 class="title">Product Not Found</h2><a href="index.html" class="banner-btn" style="display:inline-block; margin-top:20px; padding:10px 20px; background:var(--industrial-wood); color:white; border-radius:5px;">Return Home</a></div>';
      return;
    }
    
    
    // ============================================
    //    DYNAMIC META TAGS FOR WHATSAPP PREVIEW
    // ============================================
    const shareImage = (product.gallery && product.gallery.length > 0) 
      ? product.gallery[0] 
      : `${window.location.origin}/assets/images/products/placeholder.webp`;

    document.title = `${product.name} - Selection Furniture`;
    
    const updateMeta = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`) || 
                    document.querySelector(`meta[name="${property}"]`);
      if (element) {
        element.setAttribute("content", content);
      }
    };

    updateMeta("og:title", product.name);
    updateMeta("og:description", product.description || "Check out this product at Selection Furniture.");
    updateMeta("og:image", shareImage);
    updateMeta("og:url", window.location.href);
    updateMeta("twitter:title", product.name);
    updateMeta("twitter:description", product.description || "Check out this product at Selection Furniture.");
    updateMeta("twitter:image", shareImage);

    // ============================================
    //    EXISTING RENDERING LOGIC (Preserved)
    // ============================================

    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-id').innerText = product.id;
    document.getElementById('detail-desc').innerText = product.description || "Experience comfort and style with this premium furniture piece.";
    
    const currencySymbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '£';
    document.getElementById('detail-price').innerText = `${currencySymbol} Call for price`;

    const categoryEl = document.getElementById('detail-category');
    let catText = product.categories.length > 0 ? product.categories.join(' / ') : "Furniture";

    let subCats = Array.isArray(product.subcategories) ? product.subcategories : (product.subcategories ? [product.subcategories] : []);
    if (subCats.length > 0) catText += ` / ${subCats.join(', ')}`;
    categoryEl.innerText = catText;
    
    const oldPriceEl = document.getElementById('detail-old-price');
    if (product.original_price) {
      oldPriceEl.innerText = formatCurrency(product.original_price, product.currency || 'GBP');
      oldPriceEl.style.display = 'inline';
    } else {
      oldPriceEl.style.display = 'none';
    }
    
    const imgEl = document.getElementById('detail-image');
    const galleryContainer = document.getElementById('detail-gallery-container');
    let imageList = (product.gallery && product.gallery.length > 0) ? product.gallery : (product.image ? [product.image] : ['./assets/images/products/1.jpg']);

    if (imageList.length > 0) imgEl.src = imageList[0];

    galleryContainer.innerHTML = ''; 
    if (imageList.length > 1) {
      imageList.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.alt = `${product.name} view ${index + 1}`;
        Object.assign(thumb.style, { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: index === 0 ? '2px solid var(--industrial-wood)' : '1px solid #ddd', transition: '0.2s', flexShrink: '0' });

        thumb.addEventListener('click', function() {
          imgEl.src = imgSrc;
          Array.from(galleryContainer.children).forEach(child => { child.style.border = '1px solid #ddd'; child.style.opacity = '0.7'; });
          thumb.style.border = '2px solid var(--industrial-wood)';
          thumb.style.opacity = '1';
        });
        galleryContainer.appendChild(thumb);
      });
    }
    
    const ratingContainer = document.getElementById('detail-rating');
    ratingContainer.innerHTML = '';
    const rating = product.rating || 5;
    const starSVG = `<svg fill="#ca6c44" width="18px" height="18px" viewBox="0 0 64 64"><path d="M32.001,9.188l5.666,17.438l18.335,0l-14.833,10.777l5.666,17.438l-14.834,-10.777l-14.833,10.777l5.666,-17.438l-14.834,-10.777l18.335,0l5.666,-17.438Z"/></svg>`;
    const starOutlineSVG = `<svg fill="#ca6c44" width="18px" height="18px" viewBox="0 0 64 64"><path d="M37.675,26.643l18.335,0l-14.834,10.777l5.666,17.438l-14.833,-10.777l-14.834,10.777l5.666,-17.438l-14.833,-10.777l18.335,0l5.666,-17.438c1.888,5.813 3.777,11.625 5.666,17.438Zm-8.407,4.026l-8.869,0l7.175,5.213l-2.74,8.435l7.175,-5.213l7.175,5.213l-2.741,-8.435l7.175,-5.213l-8.869,0l-2.74,-8.434c-0.914,2.811 -1.827,5.623 -2.741,8.434Z"/></svg>`;
    
    for (let i = 0; i < 5; i++) {
      const span = document.createElement('span');
      span.innerHTML = i < rating ? starSVG : starOutlineSVG;
      ratingContainer.appendChild(span);
    }
    
    const bannerContainer = document.getElementById('banner-container');
    bannerContainer.querySelectorAll('.showcase-badge').forEach(b => b.remove());

    function createBadge(text, colorVar) {
      const badgeEl = document.createElement('p');
      badgeEl.className = 'showcase-badge';
      if (text.toLowerCase().includes("trending")) text = "Trending";
      const isDiscount = text.includes("%");
      
      if (isDiscount) {
        Object.assign(badgeEl.style, { position: 'absolute', top: '15px', left: '15px', zIndex: '10', padding: '0 8px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: '500', color: 'white', background: `var(${colorVar})` });
      } else {
        Object.assign(badgeEl.style, { position: 'absolute', top: '8px', left: '-29px', zIndex: '10', transform: 'rotate(-45deg)', textTransform: 'uppercase', fontSize: '11px', padding: '5px 40px', color: 'white', fontWeight: '500', background: `var(${colorVar})` });
      }
      badgeEl.innerText = text;
      bannerContainer.appendChild(badgeEl);
    }
    
    if (product.badges && product.badges.length > 0) {
      product.badges.forEach(badge => {
        let colorVar = badge.color === 'eerie-black' ? '--eerie-black' : (badge.color === 'ocean-green' ? '--ocean-green' : '--industrial-wood');
        createBadge(badge.text, colorVar);
      });
    } else if (product.is_new_arrival) {
      createBadge("New", "--industrial-wood");
    } else if (product.original_price && product.price < product.original_price) {
      createBadge("Sale", "--eerie-black");
    }
    
    const longDescWrapper = document.getElementById('detail-long-desc-wrapper');
    const longDescEl = document.getElementById('detail-long-desc');
    if (product.long_description) {
      longDescEl.innerHTML = product.long_description;
      longDescWrapper.style.display = 'block';
    } else {
      longDescWrapper.style.display = 'none';
    }

    const suggestionsWrapper = document.getElementById('suggested-products-wrapper');
    suggestionsWrapper.innerHTML = ''; 
    const otherProducts = products.filter(p => p.id !== product.id && p._id !== product._id).sort(() => 0.5 - Math.random()).slice(0, 4);
    
    otherProducts.forEach(item => {
      let itemImg = (item.gallery && item.gallery.length > 0) ? item.gallery[0] : (item.image || './assets/images/products/1.jpg');
      const cardContainer = document.createElement('div');
      cardContainer.className = 'showcase-container';
      Object.assign(cardContainer.style, { minWidth: '320px', marginRight: '5px' });
      
      cardContainer.innerHTML = `
        <div class="showcase" style="border: 1px solid var(--cultured); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; height: 100%;">
          <a href="product.html?id=${item.id}" class="showcase-img-box" style="width: 70px; height: 70px; flex-shrink: 0;">
            <img src="${itemImg}" alt="${item.name}" class="showcase-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">
          </a>
          <div class="showcase-content" style="width: calc(100% - 85px);">
            <a href="product.html?id=${item.id}">
              <h4 class="showcase-title" style="font-size: 0.9rem; font-weight: 600; color: var(--eerie-black); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-bottom: 2px;">${item.name}</h4>
            </a>
            <a href="#" class="showcase-category" style="font-size: 0.8rem; color: var(--davys-gray); margin-bottom: 3px; display:block;">${item.categories ? item.categories[0] : (item.category || 'Furniture')}</a>
            <div class="price-box" style="display: flex; align-items: center; gap: 10px;">
              <p class="price" style="color: var(--industrial-wood); font-weight: 700;">${formatCurrency(item.price, item.currency || 'GBP')}</p>
              ${item.original_price ? `<del style="color: var(--sonic-silver); font-size: 0.8rem;">${formatCurrency(item.original_price, item.currency || 'GBP')}</del>` : ''}
            </div>
          </div>
        </div>
      `;
      suggestionsWrapper.appendChild(cardContainer);
    });

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<div class="container" style="text-align:center; padding:50px; color:red;"><h2 class="title">Error Loading Product</h2><p>Please check your connection and try again.</p></div>`;
  }

  function formatCurrency(amount, currency) {
    if (!amount) return "$0.00";
    const value = amount.toFixed(2);
    const sym = currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : '£');
    return `${sym}${value}`;
  }
});
