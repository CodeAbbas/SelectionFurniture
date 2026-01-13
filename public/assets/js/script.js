'use strict';

// --- MODAL (Newsletter) ---
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

if (modal && modalCloseBtn && modalCloseOverlay) {
  const modalCloseFunc = function() { modal.classList.add('closed') }
  modalCloseOverlay.addEventListener('click', modalCloseFunc);
  modalCloseBtn.addEventListener('click', modalCloseFunc);
}

// --- NOTIFICATION TOAST ---
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

if (notificationToast && toastCloseBtn) {
  toastCloseBtn.addEventListener('click', function() {
    notificationToast.classList.add('closed');
  });
}

// --- MOBILE MENU ---
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

if (mobileMenu.length > 0) {
  for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
    const mobileMenuCloseFunc = function() {
      mobileMenu[i].classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    }
    
    mobileMenuOpenBtn[i].addEventListener('click', function() {
      mobileMenu[i].classList.add('active');
      if (overlay) overlay.classList.add('active');
    });
    
    if (mobileMenuCloseBtn[i]) {
      mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
    }
    
    if (overlay) {
      overlay.addEventListener('click', mobileMenuCloseFunc);
    }
  }
}

// --- ACCORDION (Sidebars) ---
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {
  accordionBtn[i].addEventListener('click', function() {
    const clickedBtn = this.nextElementSibling.classList.contains('active');
    for (let i = 0; i < accordion.length; i++) {
      if (clickedBtn) break;
      if (accordion[i].classList.contains('active')) {
        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');
      }
    }
    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');
  });
}

/**
 Currency Formatter
 */
function formatCurrency(amount, currency) {
  const value = amount.toFixed(2);

  if (currency === 'USD') return `$${value}`;
  if (currency === 'EUR') return `€${value}`;
  if (currency === 'GBP') return `£${value}`;

  // Default fallback if currency isn't matched
  return `${currency} ${value}`;
}

/**
 * PRODUCT INJECTION LOGIC
 */

// 1. Select the container where we want to put the products
const newProductsContainer = document.getElementById('new-products-grid');

// 2. Define a function to generate the HTML for a single product card
function generateProductCard(product) {
  let imgDefault = '';
  let imgHover = '';

  if (product.gallery && product.gallery.length >= 2) {
    // If gallery exists, use 1st and 2nd image
    imgDefault = product.gallery[0];
    imgHover = product.gallery[1];
  } else if (product.images) {
    // Fallback to old object structure
    imgDefault = product.images.default;
    imgHover = product.images.hover || product.images.default;
  } else {
    // Fallback to single image
    imgDefault = product.image;
    imgHover = product.image;
  }
  // Category 
  let displayCategory = "Furniture";

  if (product.categories && product.categories.length > 0) {
    const mainCat = product.categories.length > 1 ? product.categories[1] : product.categories[0];

    // SAFE Subcategory Check
    let subCat = "";
    if (Array.isArray(product.subcategories) && product.subcategories.length > 0) {
      subCat = product.subcategories[0];
    } else if (typeof product.subcategories === 'string') {
      subCat = product.subcategories;
    } else if (product.subcategory) {
      subCat = product.subcategory;
    }

    if (subCat) {
      displayCategory = `${mainCat} / ${subCat}`;
    } else {
      displayCategory = mainCat;
    }
  } else if (product.category) {
    displayCategory = product.category;
  }
  // Handle badges
  let badgeHtml = '';
  if (product.badges && product.badges.length > 0) {
    product.badges.forEach(badge => {
      badgeHtml += `<p class="showcase-badge ${badge.type} ${badge.color}">${badge.text}</p>`;
    });
  }

  // formatCurrency for price
  const priceHtml = `
    <div class="price-box">
      <p class="price">${formatCurrency(product.price, product.currency)}</p>
      ${product.original_price ? `<del>${formatCurrency(product.original_price, product.currency)}</del>` : ''}
    </div>
  `;

  return `
    <div class="showcase">
      <div class="showcase-banner">
        <a href="./product.html?id=${product.id}">
          <img src="${imgDefault}" alt="${product.name}" width="300" class="product-img default">
          <img src="${imgHover}" alt="${product.name}" width="300" class="product-img hover">
        </a>
        
        ${badgeHtml}
        
        <div class="showcase-actions">
          <button class="btn-action"><ion-icon name="heart-outline"></ion-icon></button>
          <button class="btn-action"><ion-icon name="eye-outline"></ion-icon></button>
          <button class="btn-action"><ion-icon name="repeat-outline"></ion-icon></button>
          <button class="btn-action"><ion-icon name="bag-add-outline"></ion-icon></button>
        </div>
      </div>
      
      <div class="showcase-content">
        <a href="#" class="showcase-category">${displayCategory}</a>
        <h3><a href="./product.html?id=${product.id}" class="showcase-title">${product.name}</a></h3>
        <div class="showcase-rating">
          <ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star-outline"></ion-icon><ion-icon name="star-outline"></ion-icon>
        </div>
        ${priceHtml}
      </div>
    </div>
  `;
}

// 3. FETCH AND RENDER FROM MONGODB API
async function loadNewProducts() {
  if (!newProductsContainer) return;

  try {
    // Show a loading state (optional)
    newProductsContainer.innerHTML = '<p class="loading-text">Loading new arrivals...</p>';

    // Fetch from your Next.js API
    const response = await fetch('../api/products');
    
    if (!response.ok) {
      throw new Error('Failed to connect to the database');
    }

    const fetchedProducts = await response.json();

    if (fetchedProducts.length === 0) {
      newProductsContainer.innerHTML = '<p>No products found.</p>';
      return;
    }

    // Sort by newest first  -> Get last 8
    const newArrivals = fetchedProducts.reverse().slice(0, 8);

    // Map them to HTML and inject
    newProductsContainer.innerHTML = newArrivals.map(product => generateProductCard(product)).join('');

  } catch (error) {
    console.error("Error loading products:", error);
    newProductsContainer.innerHTML = '<p>Could not load products. Please check connection.</p>';
  }
}

// Run the fetch when the page loads
document.addEventListener('DOMContentLoaded', loadNewProducts);


/**
 * DEAL OF THE DAY
 */

const dailyDealsContainer = document.getElementById('daily-deals-container');

// Helper: Generate Star Ratings HTML
function generateStars(rating) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '<ion-icon name="star"></ion-icon>';
    } else {
      starsHtml += '<ion-icon name="star-outline"></ion-icon>';
    }
  }
  return starsHtml;
}

// Function to generate the HTML for a Deal Card
function generateDealCard(product) {
  // 1. Calculate Stock Bar Percentage
  const total = product.stock_status.sold + product.stock_status.available;
  const soldPercentage = Math.round((product.stock_status.sold / total) * 100);

  // 2. Build HTML (UPDATED PRICES)
  return `
    <div class="showcase-container">
      <div class="showcase">
        
        <div class="showcase-banner">
          <img src="${product.image}" alt="${product.name}" class="showcase-img">
        </div>

        <div class="showcase-content">
          
          <div class="showcase-rating">
            ${generateStars(product.rating)}
          </div>

          <a href="./product.html?id=${product.id}">
            <h3 class="showcase-title">${product.name}</h3>
          </a>

          <p class="showcase-desc">${product.description}</p>

          <div class="price-box">
            <p class="price">${formatCurrency(product.price, product.currency)}</p>
            <del>${formatCurrency(product.original_price, product.currency)}</del>
          </div>

          <button class="add-cart-btn">add to cart</button>

          <div class="showcase-status">
            <div class="wrapper">
              <p>already sold: <b>${product.stock_status.sold}</b></p>
              <p>available: <b>${product.stock_status.available}</b></p>
            </div>
            <div class="showcase-status-bar" style="width: 100%">
               <div style="height: 100%; width: ${soldPercentage}%; background: var(--industrial-wood); border-radius: 4px;"></div>
            </div>
          </div>

          <div class="countdown-box">
            <p class="countdown-desc">Hurry Up! Offer ends in:</p>
            <div class="countdown" data-deadline="${product.offer_end_date}">
              <div class="countdown-content">
                <p class="display-number days">00</p>
                <p class="display-text">Days</p>
              </div>
              <div class="countdown-content">
                <p class="display-number hours">00</p>
                <p class="display-text">Hours</p>
              </div>
              <div class="countdown-content">
                <p class="display-number minutes">00</p>
                <p class="display-text">Min</p>
              </div>
              <div class="countdown-content">
                <p class="display-number seconds">00</p>
                <p class="display-text">Sec</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

// Render Deals
if (dailyDealsContainer && typeof products !== 'undefined') {
  // Filter only 'deal' type products
  const dealProducts = products.filter(p => p.type === 'deal');
  dailyDealsContainer.innerHTML = dealProducts.map(product => generateDealCard(product)).join('');
  
  initCountdowns();
}

/**
 * COUNTDOWN TIMER LOGIC
 */
function initCountdowns() {
  const countdowns = document.querySelectorAll('[data-deadline]');
  
  countdowns.forEach(item => {
    const deadline = new Date(item.dataset.deadline).getTime();
    
    // Update every second
    const x = setInterval(function() {
      const now = new Date().getTime();
      const distance = deadline - now;
      
      // Time calculations
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Display result in the elements with specific classes
      item.querySelector('.days').innerText = days < 10 ? '0' + days : days;
      item.querySelector('.hours').innerText = hours < 10 ? '0' + hours : hours;
      item.querySelector('.minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
      item.querySelector('.seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
      
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(x);
        item.innerHTML = "EXPIRED";
      }
    }, 1000);
  });
}
/**
 * MINIMAL PRODUCT LISTS (New Arrivals, Trending, Top Rated)
 */

// HTML Generator for the small horizontal card
function generateMinimalCard(product) {
  const image = (product.gallery && product.gallery[0]) 
    ? product.gallery[0] 
    : (product.image || './assets/images/products/clothes-1.jpg');

  const category = (product.categories && product.categories.length > 0) 
    ? product.categories[0] 
    : 'Furniture';

  return `
    <div class="showcase">
      <a href="./product.html?id=${product.id}" class="showcase-img-box">
        <img src="${image}" alt="${product.name}" width="70" class="showcase-img">
      </a>
      <div class="showcase-content">
        <a href="./product.html?id=${product.id}">
          <h4 class="showcase-title">${product.name}</h4>
        </a>
        <a href="#" class="showcase-category">${category}</a>
        <div class="price-box">
          <p class="price">${formatCurrency(product.price, product.currency)}</p>
          ${product.original_price ? `<del>${formatCurrency(product.original_price, product.currency)}</del>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Function to fetch and render a specific section
async function loadMinimalSection(apiQuery, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch(`/api/products?${apiQuery}`);
    const products = await res.json();

    if (!products || products.length === 0) return;

    // We need to group items into containers of 4 items each
    const chunkSize = 4;
    let htmlContent = '';

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      
      // Create a column container
      htmlContent += `<div class="showcase-container">`;
      // Add the cards inside
      htmlContent += chunk.map(p => generateMinimalCard(p)).join('');
      // Close column
      htmlContent += `</div>`;
    }

    container.innerHTML = htmlContent;

  } catch (err) {
    console.error(`Error loading ${containerId}:`, err);
  }
}

// Load all 3 sections when page loads
document.addEventListener('DOMContentLoaded', () => {
  // 1. New Arrivals: Sort by newest, Limit 8
  loadMinimalSection('sort=newest&limit=8', 'minimal-new-arrivals');

  // 2. Trending: Is Best Seller = true, Limit 8
  loadMinimalSection('is_best_seller=true&limit=8', 'minimal-trending');

  // 3. Top Rated: Sort by rating, Limit 8
  loadMinimalSection('sort=rating&limit=8', 'minimal-top-rated');
});