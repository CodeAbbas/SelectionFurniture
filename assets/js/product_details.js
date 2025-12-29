document.addEventListener("DOMContentLoaded", function() {
  
  // 1. Get Product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  // 2. Find the product in database
  const product = products.find(p => p.id === productId);
  
  // Handle Product Not Found
  if (!product) {
    document.querySelector('.product-container').innerHTML =
      '<div class="container" style="text-align:center; padding:50px;"><h2 class="title">Product Not Found</h2><a href="index.html" class="banner-btn">Return Home</a></div>';
    return;
  }
  
  // 3. Inject Main Details
  document.getElementById('detail-name').innerText = product.name;
  document.getElementById('detail-category').innerText = product.category;
  document.getElementById('detail-id').innerText = product.id;
  document.getElementById('detail-desc').innerText = product.description || "Experience comfort and style with this premium furniture piece.";
  document.getElementById('detail-price').innerText = formatCurrency(product.price, product.currency);
  
  // Old Price Logic
  const oldPriceEl = document.getElementById('detail-old-price');
  if (product.original_price) {
    oldPriceEl.innerText = formatCurrency(product.original_price, product.currency);
    oldPriceEl.style.display = 'inline';
  } else {
    oldPriceEl.style.display = 'none';
  }
  
  // --- IMAGE & GALLERY LOGIC ---
  const imgEl = document.getElementById('detail-image');
  const galleryContainer = document.getElementById('detail-gallery-container');
  
  // 1. Consolidate all available images into a single list
  let imageList = [];
  
  if (product.gallery && product.gallery.length > 0) {
    // Priority: Use the new gallery array
    imageList = product.gallery;
  } else if (product.images && product.images.default) {
    // Fallback: Use old object format
    imageList.push(product.images.default);
    if (product.images.hover) imageList.push(product.images.hover);
  } else if (product.image) {
    // Fallback: Use single string format
    imageList.push(product.image);
  }

  // 2. Set Main Image (First one in list)
  if (imageList.length > 0) {
    imgEl.src = imageList[0];
  }

  // 3. Generate Thumbnails
  galleryContainer.innerHTML = ''; // Clear existing
  
  if (imageList.length > 1) {
    imageList.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${product.name} view ${index + 1}`;
      
      // Styling for thumbnails
      thumb.style.width = '70px';
      thumb.style.height = '70px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = '5px';
      thumb.style.cursor = 'pointer';
      thumb.style.border = index === 0 ? '2px solid var(--industrial-wood)' : '1px solid #ddd';
      thumb.style.transition = '0.2s';

      // Click Event: Swap Main Image
      thumb.addEventListener('click', function() {
        imgEl.src = imgSrc;
        
        // Update active border styling
        Array.from(galleryContainer.children).forEach(child => {
          child.style.border = '1px solid #ddd';
          child.style.opacity = '0.7';
        });
        thumb.style.border = '2px solid var(--industrial-wood)';
        thumb.style.opacity = '1';
      });

      galleryContainer.appendChild(thumb);
    });
  }
  
  // --- CUSTOM SVG STARS (Saddle Brown) ---
  const ratingContainer = document.getElementById('detail-rating');
  ratingContainer.innerHTML = '';
  const rating = product.rating || 5;
  
  // Custom SVG path for a star (Filled)
  const starSVG = `
<svg fill="#ca6c44" width="18px" height="18px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
<path d="M32.001,9.188l5.666,17.438l18.335,0l-14.833,10.777l5.666,17.438l-14.834,-10.777l-14.833,10.777l5.666,-17.438l-14.834,-10.777l18.335,0l5.666,-17.438Z"/>
</svg>`;
  
  // Custom SVG path for a star (Outline/Empty)
  const starOutlineSVG = `
<svg fill="#ca6c44" width="18px" height="18px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
<path d="M37.675,26.643l18.335,0l-14.834,10.777l5.666,17.438l-14.833,-10.777l-14.834,10.777l5.666,-17.438l-14.833,-10.777l18.335,0l5.666,-17.438c1.888,5.813 3.777,11.625 5.666,17.438Zm-8.407,4.026l-8.869,0l7.175,5.213l-2.74,8.435l7.175,-5.213l7.175,5.213l-2.741,-8.435l7.175,-5.213l-8.869,0l-2.74,-8.434c-0.914,2.811 -1.827,5.623 -2.741,8.434Z" style="fill-rule:nonzero;"/>
</svg>`;
  
  for (let i = 0; i < 5; i++) {
    const starHTML = i < rating ? starSVG : starOutlineSVG;
    const span = document.createElement('span');
    span.innerHTML = starHTML;
    ratingContainer.appendChild(span);
  }
  
  // Deal Logic (Timer & Stock)
  if (product.type === 'deal' && product.stock_status) {
    document.getElementById('detail-deal-section').style.display = 'block';
    document.getElementById('detail-sold').innerText = product.stock_status.sold;
    document.getElementById('detail-available').innerText = product.stock_status.available;
    const percentage = (product.stock_status.sold / product.stock_status.total) * 100;
    document.getElementById('detail-bar').innerHTML = `<div style="position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; background: var(--industrial-wood); width: ${percentage}%"></div>`;
  }
  
  // --- SMART BADGE LOGIC ---
  const bannerContainer = document.getElementById('banner-container');
  
  function createBadge(text, colorVar) {
    const badgeEl = document.createElement('p');
    badgeEl.className = 'showcase-badge';
    
    // Normalize Text
    if (text.toLowerCase().includes("trending")) text = "Trending";
    
    // 1. Check if it's a discount (%)
    const isDiscount = text.includes("%");
    
    if (isDiscount) {
      // === RECTANGULAR BADGE (Flat) ===
      badgeEl.style.position = 'absolute';
      badgeEl.style.top = '15px';
      badgeEl.style.left = '15px';
      badgeEl.style.zIndex = '10';
      badgeEl.style.padding = '0 8px';
      badgeEl.style.borderRadius = '5px';
      badgeEl.style.fontSize = '0.9rem';
      badgeEl.style.fontWeight = '500';
      badgeEl.style.color = 'white';
      badgeEl.style.background = `var(${colorVar})`;
      
    } else {
      // === RIBBON BADGE (Angled/Rotating) ===
      // Matches the .angle css from New Arrivals
      badgeEl.style.position = 'absolute';
      badgeEl.style.top = '8px';
      badgeEl.style.left = '-29px';
      badgeEl.style.zIndex = '10';
      badgeEl.style.transform = 'rotate(-45deg)';
      badgeEl.style.textTransform = 'uppercase';
      badgeEl.style.fontSize = '11px';
      badgeEl.style.padding = '5px 40px';
      badgeEl.style.color = 'white';
      badgeEl.style.fontWeight = '500';
      badgeEl.style.background = `var(${colorVar})`;
    }
    
    badgeEl.innerText = text;
    bannerContainer.appendChild(badgeEl);
  }
  
  // Determine Badge Data & Color
  if (product.badges && product.badges.length > 0) {
    const badge = product.badges[0];
    let colorVar = badge.color === 'eerie-black' ? '--eerie-black' : '--industrial-wood';
    if (badge.color === 'ocean-green') colorVar = '--ocean-green';
    
    createBadge(badge.text, colorVar);
  } else if (product.badge) {
    createBadge(product.badge, '--industrial-wood');
  } else if (product.is_new_arrival) {
    createBadge("New", "--industrial-wood");
  } else if (product.original_price && product.price < product.original_price) {
    createBadge("Sale", "--eerie-black");
  }
  
  // --- INJECT LONG DESCRIPTION ---
  const longDescWrapper = document.getElementById('detail-long-desc-wrapper');
  const longDescEl = document.getElementById('detail-long-desc');

  if (product.long_description) {
    // If long description exists, show the section and inject content
    longDescEl.innerHTML = product.long_description;
    longDescWrapper.style.display = 'block';
  } else {
    // Optional: Fallback to the short description if no long one exists
    // longDescEl.innerHTML = product.description; 
    // longDescWrapper.style.display = 'block';
    
    // Or just hide the section entirely
    longDescWrapper.style.display = 'none';
  }
  // --- "YOU MAY ALSO LIKE" (Compact Horizontal Cards) ---
  const suggestionsWrapper = document.getElementById('suggested-products-wrapper');
  
  const otherProducts = products.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
  
  otherProducts.forEach(item => {
    let itemImg = item.image;
    if (item.images && item.images.default) itemImg = item.images.default;
    
    const container = document.createElement('div');
    container.className = 'showcase-container';
    container.style.minWidth = '320px';
    container.style.marginRight = '5px';
    
    const cardHTML = `
      <div class="showcase" style="border: 1px solid var(--cultured); padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; height: 100%;">
        
        <a href="product.html?id=${item.id}" class="showcase-img-box" style="width: 70px; height: 70px; flex-shrink: 0;">
          <img src="${itemImg}" alt="${item.name}" width="70" class="showcase-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">
        </a>

        <div class="showcase-content" style="width: calc(100% - 85px);">
          <a href="product.html?id=${item.id}">
            <h4 class="showcase-title" style="font-size: 0.9rem; font-weight: 600; color: var(--eerie-black); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-bottom: 2px;">
              ${item.name}
            </h4>
          </a>
          
          <a href="#" class="showcase-category" style="font-size: 0.8rem; color: var(--davys-gray); margin-bottom: 3px; display:block;">
            ${item.category}
          </a>

          <div class="price-box" style="display: flex; align-items: center; gap: 10px;">
            <p class="price" style="color: var(--industrial-wood); font-weight: 700;">${formatCurrency(item.price, item.currency)}</p>
            ${item.original_price ? `<del style="color: var(--sonic-silver); font-size: 0.8rem;">${formatCurrency(item.original_price, item.currency)}</del>` : ''}
          </div>
        </div>

      </div>
    `;
    
    container.innerHTML = cardHTML;
    suggestionsWrapper.appendChild(container);
  });
  
  function formatCurrency(amount, currency) {
    const value = amount.toFixed(2);

    if (currency === 'USD') return `$${value}`;
    if (currency === 'EUR') return `€${value}`;
    if (currency === 'GBP') return `£${value}`;

    // Default fallback if currency isn't matched
    return `${currency} ${value}`;
  }
  
});