document.addEventListener("DOMContentLoaded", function() {
  
  // 1. Get Product ID
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  // 2. Find Product
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    document.querySelector('.product-container').innerHTML =
      '<div class="container" style="text-align:center; padding:50px;"><h2 class="title">Product Not Found</h2><a href="index.html" class="banner-btn">Return Home</a></div>';
    return;
  }
  
  // 3. Inject Details
  document.getElementById('detail-name').innerText = product.name;
  document.getElementById('detail-category').innerText = product.category;
  document.getElementById('detail-id').innerText = product.id;
  document.getElementById('detail-desc').innerText = product.description || "Experience comfort and style.";
  document.getElementById('detail-price').innerText = formatCurrency(product.price, product.currency);
  
  if (product.original_price) {
    const oldPriceEl = document.getElementById('detail-old-price');
    oldPriceEl.innerText = formatCurrency(product.original_price, product.currency);
    oldPriceEl.style.display = 'inline';
  } else {
    document.getElementById('detail-old-price').style.display = 'none';
  }
  
  const imgEl = document.getElementById('detail-image');
  if (typeof product.images === 'object' && product.images.default) {
    imgEl.src = product.images.default;
  } else {
    imgEl.src = product.image;
  }
  
  // Rating Stars
  const ratingContainer = document.getElementById('detail-rating');
  ratingContainer.innerHTML = '';
  const rating = product.rating || 5;
  for (let i = 0; i < 5; i++) {
    const icon = i < rating ? 'star' : 'star-outline';
    ratingContainer.innerHTML += `<ion-icon name="${icon}"></ion-icon>`;
  }
  
  // Deal Logic
  if (product.type === 'deal' && product.stock_status) {
    document.getElementById('detail-deal-section').style.display = 'block';
    document.getElementById('detail-sold').innerText = product.stock_status.sold;
    document.getElementById('detail-available').innerText = product.stock_status.available;
    const percentage = (product.stock_status.sold / product.stock_status.total) * 100;
    document.getElementById('detail-bar').innerHTML = `<div style="position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; background: var(--industrial-wood); width: ${percentage}%"></div>`;
  }
  
  // 4. Badges (Using exact classes)
  const badgeContainer = document.getElementById('detail-badge-container');
  
  function createBadge(text, colorClass) {
    const badgeEl = document.createElement('p');
    // The class 'angle' handles the rotation and positioning (-29px left)
    badgeEl.className = `showcase-badge angle ${colorClass}`;
    if (text.toLowerCase().includes("trending")) text = "Trending";
    badgeEl.innerText = text;
    badgeContainer.appendChild(badgeEl);
  }
  
  if (product.badges && product.badges.length > 0) {
    const badge = product.badges[0];
    let colorClass = badge.color === 'eerie-black' ? 'black' : 'pink';
    createBadge(badge.text, colorClass);
  } else if (product.badge) {
    createBadge(product.badge, 'pink');
  } else if (product.is_new_arrival) {
    createBadge("New", "pink");
  } else if (product.original_price && product.price < product.original_price) {
    createBadge("Sale", "black");
  }
  
  // 5. Suggestions Slider
  const suggestionsWrapper = document.getElementById('suggested-products-wrapper');
  const otherProducts = products.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 4);
  
  otherProducts.forEach(item => {
    let itemImg = item.image;
    if (item.images && item.images.default) itemImg = item.images.default;
    
    // Create a container for EACH product so they slide independently
    const container = document.createElement('div');
    container.className = 'showcase-container';
    // Fix iOS 12 Gap issue: Add margin-right to the container
    container.style.marginRight = '15px';
    
    const cardHTML = `
      <div class="showcase">
        <a href="product.html?id=${item.id}" class="showcase-img-box">
          <img src="${itemImg}" alt="${item.name}" width="70" class="showcase-img">
        </a>
        <div class="showcase-content">
          <a href="product.html?id=${item.id}">
            <h4 class="showcase-title">${item.name}</h4>
          </a>
          <a href="#" class="showcase-category">${item.category}</a>
          <div class="price-box">
            <p class="price">${formatCurrency(item.price, item.currency)}</p>
            ${item.original_price ? `<del>${formatCurrency(item.original_price, item.currency)}</del>` : ''}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = cardHTML;
    suggestionsWrapper.appendChild(container);
  });
  
  function formatCurrency(amount, currency) {
    return currency === 'USD' ? `$${amount.toFixed(2)}` : `€${amount.toFixed(2)}`;
  }
});