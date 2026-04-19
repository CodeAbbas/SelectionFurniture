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

// --- MOBILE MENU & SIDEBAR (Updated for Click-Anywhere) ---
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenus = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

// Centralized close function
const closeAllMenus = () => {
  mobileMenus.forEach(menu => menu.classList.remove('active'));
  if (overlay) overlay.classList.remove('active');
};

// Open Button Events
mobileMenuOpenBtn.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Stops immediate trigger of the document click listener
    mobileMenus.forEach(menu => menu.classList.add('active'));
    if (overlay) overlay.classList.add('active');
  });
});

// Close Button Events
mobileMenuCloseBtn.forEach(btn => {
  btn.addEventListener('click', closeAllMenus);
});

// Overlay Click Event
if (overlay) {
  overlay.addEventListener('click', closeAllMenus);
}
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('.search-field');
  const searchBtn = document.querySelector('.search-btn');

  const executeSearch = () => {
    const query = searchInput.value.trim();
    if (query) {
      // Pushes search queries to the browser's URL parameters.
      window.location.href = `category.html?q=${encodeURIComponent(query)}`;
    }
  };

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', executeSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });
  }
});
// Global Document Listener for "Outside" clicks
document.addEventListener('click', (event) => {
  mobileMenus.forEach(menu => {
    if (menu.classList.contains('active')) {
      const isClickInside = menu.contains(event.target);
      const isClickOnOpenBtn = Array.from(mobileMenuOpenBtn).some(btn => btn.contains(event.target));

      // If the click is not inside the menu and not on an opening button, close it
      if (!isClickInside && !isClickOnOpenBtn) {
        closeAllMenus();
      }
    }
  });
});

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
  return `${currency} ${value}`;
}

/**
 * PRODUCT INJECTION LOGIC
 */
const newProductsContainer = document.getElementById('new-products-grid');

function generateProductCard(product) {
  let imgDefault = '';
  let imgHover = '';

  if (product.gallery && product.gallery.length >= 2) {
    imgDefault = product.gallery[0];
    imgHover = product.gallery[1];
  } else if (product.images) {
    imgDefault = product.images.default;
    imgHover = product.images.hover || product.images.default;
  } else {
    imgDefault = product.image;
    imgHover = product.image;
  }

  let displayCategory = "Furniture";
  if (product.categories && product.categories.length > 0) {
    const mainCat = product.categories.length > 1 ? product.categories[1] : product.categories[0];
    let subCat = "";
    if (Array.isArray(product.subcategories) && product.subcategories.length > 0) {
      subCat = product.subcategories[0];
    } else if (typeof product.subcategories === 'string') {
      subCat = product.subcategories;
    } else if (product.subcategory) {
      subCat = product.subcategory;
    }
    displayCategory = subCat ? `${mainCat} / ${subCat}` : mainCat;
  } else if (product.category) {
    displayCategory = product.category;
  }

  let badgeHtml = '';
  if (product.badges && product.badges.length > 0) {
    product.badges.forEach(badge => {
      badgeHtml += `<p class="showcase-badge ${badge.type} ${badge.color}">${badge.text}</p>`;
    });
  }

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

async function loadNewProducts() {
  if (!newProductsContainer) return;
  try {
    newProductsContainer.innerHTML = '<p class="loading-text">Loading new arrivals...</p>';
    const response = await fetch('../api/products');
    if (!response.ok) throw new Error('Failed to connect to the database');
    const fetchedProducts = await response.json();
    if (fetchedProducts.length === 0) {
      newProductsContainer.innerHTML = '<p>No products found.</p>';
      return;
    }
    const newArrivals = fetchedProducts.reverse().slice(0, 8);
    newProductsContainer.innerHTML = newArrivals.map(product => generateProductCard(product)).join('');
  } catch (error) {
    console.error("Error loading products:", error);
    newProductsContainer.innerHTML = '<p>Could not load products. Please check connection.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadNewProducts);

/**
 * DEAL OF THE DAY
 */
const dailyDealsContainer = document.getElementById('daily-deals-container');

function generateStars(rating) {
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += i <= rating ? '<ion-icon name="star"></ion-icon>' : '<ion-icon name="star-outline"></ion-icon>';
  }
  return starsHtml;
}

function generateDealCard(product) {
  const total = product.stock_status.sold + product.stock_status.available;
  const soldPercentage = Math.round((product.stock_status.sold / total) * 100);

  return `
    <div class="showcase-container">
      <div class="showcase">
        <div class="showcase-banner">
          <img src="${product.image}" alt="${product.name}" class="showcase-img">
        </div>
        <div class="showcase-content">
          <div class="showcase-rating">${generateStars(product.rating)}</div>
          <a href="./product.html?id=${product.id}"><h3 class="showcase-title">${product.name}</h3></a>
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
              <div class="countdown-content"><p class="display-number days">00</p><p class="display-text">Days</p></div>
              <div class="countdown-content"><p class="display-number hours">00</p><p class="display-text">Hours</p></div>
              <div class="countdown-content"><p class="display-number minutes">00</p><p class="display-text">Min</p></div>
              <div class="countdown-content"><p class="display-number seconds">00</p><p class="display-text">Sec</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

if (dailyDealsContainer && typeof products !== 'undefined') {
  const dealProducts = products.filter(p => p.type === 'deal');
  dailyDealsContainer.innerHTML = dealProducts.map(product => generateDealCard(product)).join('');
  initCountdowns();
}

function initCountdowns() {
  const countdowns = document.querySelectorAll('[data-deadline]');
  countdowns.forEach(item => {
    const deadline = new Date(item.dataset.deadline).getTime();
    const x = setInterval(function() {
      const now = new Date().getTime();
      const distance = deadline - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      item.querySelector('.days').innerText = days < 10 ? '0' + days : days;
      item.querySelector('.hours').innerText = hours < 10 ? '0' + hours : hours;
      item.querySelector('.minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
      item.querySelector('.seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
      if (distance < 0) { clearInterval(x); item.innerHTML = "EXPIRED"; }
    }, 1000);
  });
}

/**
 * MINIMAL PRODUCT LISTS
 */
function generateMinimalCard(product) {
  const image = (product.gallery && product.gallery[0]) ? product.gallery[0] : (product.image || './assets/images/products/placeholder.webp');
  const category = (product.categories && product.categories.length > 0) ? product.categories[0] : 'Furniture';
  return `
    <div class="showcase">
      <a href="./product.html?id=${product.id}" class="showcase-img-box">
        <img src="${image}" alt="${product.name}" width="70" class="showcase-img">
      </a>
      <div class="showcase-content">
        <a href="./product.html?id=${product.id}"><h4 class="showcase-title">${product.name}</h4></a>
        <a href="#" class="showcase-category">${category}</a>
        <div class="price-box">
          <p class="price">${formatCurrency(product.price, product.currency)}</p>
          ${product.original_price ? `<del>${formatCurrency(product.original_price, product.currency)}</del>` : ''}
        </div>
      </div>
    </div>
  `;
}

async function loadMinimalSection(apiQuery, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(`/api/products?${apiQuery}`);
    const products = await res.json();
    if (!products || products.length === 0) return;
    const chunkSize = 4;
    let htmlContent = '';
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      htmlContent += `<div class="showcase-container">${chunk.map(p => generateMinimalCard(p)).join('')}</div>`;
    }
    container.innerHTML = htmlContent;
  } catch (err) {
    console.error(`Error loading ${containerId}:`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMinimalSection('sort=newest&limit=8', 'minimal-new-arrivals');
  loadMinimalSection('is_best_seller=true&limit=8', 'minimal-trending');
  loadMinimalSection('sort=rating&limit=8', 'minimal-top-rated');
});