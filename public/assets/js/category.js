document.addEventListener("DOMContentLoaded", function() {
  
  const productGrid = document.getElementById('category-product-grid');
  const countLabel = document.getElementById('product-count');
  const sortSelect = document.getElementById('sort-select');
  const breadcrumb = document.getElementById('breadcrumb-current');
  const filterListContainer = document.getElementById('category-filter-list');
  
  // --- PAGINATION SETTINGS ---
  const ITEMS_PER_PAGE = 30;
  let activeList = []; // Stores the full filtered list
  let visibleCount = 0; // Tracks how many are currently shown
  let loadMoreBtn = null; // Will hold the button element

  // State
  let currentProducts = []; 
  
  // 1. READ URL PARAMS
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');     
  const urlSubcategory = urlParams.get('subcategory'); 

  // 2. INITIALIZE PAGE
  if (urlCategory) {
    breadcrumb.innerText = urlSubcategory ? `${urlCategory} / ${urlSubcategory}` : urlCategory;
  }

  // --- CREATE LOAD MORE BUTTON ---
  function createLoadMoreButton() {
    // Check if it already exists to avoid duplicates
    if (document.getElementById('load-more-btn')) return;

    loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.innerText = 'Load More Products';
    loadMoreBtn.style.cssText = `
      display: none;
      margin: 40px auto;
      padding: 12px 30px;
      background: var(--industrial-wood);
      color: white;
      font-weight: 600;
      border-radius: 5px;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.9rem;
      transition: background 0.3s;
    `;
    
    loadMoreBtn.addEventListener('mouseover', () => loadMoreBtn.style.background = 'var(--eerie-black)');
    loadMoreBtn.addEventListener('mouseout', () => loadMoreBtn.style.background = 'var(--industrial-wood)');
    loadMoreBtn.addEventListener('click', () => {
      renderNextBatch();
    });

    // Insert after the grid
    productGrid.parentNode.appendChild(loadMoreBtn);
  }

  // --- FETCH FUNCTION ---
  async function fetchProducts() {
    try {
      productGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding: 40px; color: var(--sonic-silver);">Loading products...</div>';
      
      let apiUrl = '/api/products';
      const params = new URLSearchParams();
      if (urlCategory) params.append('category', urlCategory);
      if (urlSubcategory) params.append('subcategory', urlSubcategory);
      
      const fullUrl = params.toString() ? `${apiUrl}?${params.toString()}` : apiUrl;

      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error("API Connection Error");
      
      const dbData = await response.json();

      // --- ADAPTER: Convert DB format to Template format ---
      currentProducts = dbData.map(p => ({
        ...p,
        // Fix Image: Use first gallery image or fallback
        image: (p.gallery && p.gallery.length > 0) ? p.gallery[0] : (p.image || './assets/images/products/placeholder.webp'),
        // Fix ID: Ensure 'id' exists
        id: p.id || p._id,
        // Ensure numbers
        price: Number(p.price),
        original_price: Number(p.original_price)
      }));
      
      createLoadMoreButton(); // Initialize the button
      initRichFilters();
      filterAndRender();

    } catch (err) {
      console.error(err);
      productGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red; padding: 40px;">Could not load products.</div>';
    }
  }

  fetchProducts();

  // --- HELPER FUNCTIONS ---
  function toTitleCase(str) {
    if (!str) return null;
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  function getSubcategories(p) {
    let rawSubs = [];
    if (Array.isArray(p.subcategories)) {
      rawSubs = p.subcategories;
    } else if (typeof p.subcategories === 'string' && p.subcategories.trim() !== '') {
      rawSubs = [p.subcategories];
    } else if (p.subcategory && p.subcategory.trim() !== '') {
      rawSubs = [p.subcategory];
    }
    return rawSubs.filter(s => s && s.trim() !== '').map(s => toTitleCase(s.trim()));
  }

  function initRichFilters() {
    filterListContainer.innerHTML = ''; 
    const hierarchy = {};
    
    currentProducts.forEach(p => {
      const pCats = p.categories || (p.category ? [p.category] : []);
      const pSubs = getSubcategories(p); 
      
      pCats.forEach(catName => {
        if (!hierarchy[catName]) hierarchy[catName] = new Set();
        pSubs.forEach(sub => hierarchy[catName].add(sub));
      });
    });

    Object.keys(hierarchy).sort().forEach(cat => {
      const subcats = Array.from(hierarchy[cat]).sort();
      const hasChildren = subcats.length > 0;
      
      const li = document.createElement('li');
      li.className = 'filter-tree-item';
      if(cat === urlCategory) li.classList.add('active');
      const parentChecked = (cat === urlCategory && !urlSubcategory) ? 'checked' : '';

      let html = `
        <div class="filter-tree-parent">
          <div class="filter-group-label">
            <input type="checkbox" class="filter-checkbox cat-filter" value="${cat}" ${parentChecked}>
            <label>${cat}</label>
          </div>
          ${hasChildren ? '<ion-icon name="chevron-down-outline" class="toggle-icon"></ion-icon>' : ''}
        </div>`;

      if (hasChildren) {
        html += `<ul class="filter-tree-children">`;
        subcats.forEach(sub => {
          const subChecked = (cat === urlCategory && sub === urlSubcategory) ? 'checked' : '';
          html += `
            <li class="sub-item">
              <input type="checkbox" class="filter-checkbox sub-filter" data-parent="${cat}" value="${sub}" ${subChecked}>
              <label>${sub}</label>
            </li>`;
        });
        html += `</ul>`;
      }

      li.innerHTML = html;
      filterListContainer.appendChild(li);

      if (hasChildren) {
        li.querySelector('.filter-tree-parent').addEventListener('click', (e) => {
          if (e.target.type !== 'checkbox' && e.target.tagName !== 'LABEL') {
            li.classList.toggle('active');
          }
        });
      }
    });

    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.addEventListener('change', filterAndRender));
  }

  // --- FILTER LOGIC ---
  function filterAndRender() {
    let filtered = [...currentProducts];

    // 1. Category Filters
    const activeFilters = {}; 
    document.querySelectorAll('.cat-filter:checked').forEach(cb => {
      const parent = cb.value;
      if (!activeFilters[parent]) activeFilters[parent] = { parentChecked: true, children: new Set() };
      else activeFilters[parent].parentChecked = true;
    });

    document.querySelectorAll('.sub-filter:checked').forEach(cb => {
      const parent = cb.dataset.parent;
      const sub = cb.value;
      if (!activeFilters[parent]) activeFilters[parent] = { parentChecked: false, children: new Set() };
      activeFilters[parent].children.add(sub);
    });

    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter(p => {
        const pCats = p.categories || (p.category ? [p.category] : []);
        const pSubs = getSubcategories(p); 
        return Object.keys(activeFilters).some(parentKey => {
          if (!pCats.includes(parentKey)) return false;
          const group = activeFilters[parentKey];
          return (group.children.size > 0) ? pSubs.some(s => group.children.has(s)) : group.parentChecked;
        });
      });
    }

    // 2. Price Filters
    const min = document.getElementById('min-price').value;
    const max = document.getElementById('max-price').value;
    if(min) filtered = filtered.filter(p => p.price >= min);
    if(max) filtered = filtered.filter(p => p.price <= max);

    // 3. Status Filters
    if(document.getElementById('filter-sale').checked) {
      filtered = filtered.filter(p => (p.original_price && p.price < p.original_price) || (p.badges && p.badges.some(b => b.text.toLowerCase() === 'sale')));
    }
    if(document.getElementById('filter-new').checked) {
      filtered = filtered.filter(p => p.is_new_arrival);
    }

    // 4. Sorting
    const sortValue = sortSelect.value;
    if(sortValue === 'price-low') filtered.sort((a,b) => a.price - b.price);
    if(sortValue === 'price-high') filtered.sort((a,b) => b.price - a.price);
    if(sortValue === 'newest') filtered.sort((a,b) => (b.is_new_arrival === true) - (a.is_new_arrival === true));

    // --- RESET PAGINATION ---
    activeList = filtered;
    countLabel.innerText = activeList.length;
    visibleCount = 0;
    productGrid.innerHTML = ''; // Clear existing
    
    // Check if empty
    if (activeList.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">No products found.</p>';
      if(loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    // Initial Render
    renderNextBatch();
  }

  // --- RENDER BATCH (PAGINATION) ---
  function renderNextBatch() {
    // 1. Calculate end index
    const nextLimit = visibleCount + ITEMS_PER_PAGE;
    
    // 2. Get the slice of products to add
    const batch = activeList.slice(visibleCount, nextLimit);
    
    if (batch.length > 0 && typeof generateProductCard === 'function') {
      // Append HTML to the grid
      productGrid.insertAdjacentHTML('beforeend', batch.map(product => generateProductCard(product)).join(''));
    }

    // 3. Update counter
    visibleCount = nextLimit;

    // 4. Handle Button Visibility
    if (loadMoreBtn) {
      if (visibleCount >= activeList.length) {
        loadMoreBtn.style.display = 'none'; // All items shown
      } else {
        loadMoreBtn.style.display = 'block'; // More items exist
      }
    }
  }

  sortSelect.addEventListener('change', filterAndRender);
  document.getElementById('apply-price').addEventListener('click', filterAndRender);
  document.getElementById('filter-sale').addEventListener('change', filterAndRender);
  document.getElementById('filter-new').addEventListener('change', filterAndRender);
});