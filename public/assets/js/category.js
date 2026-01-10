document.addEventListener("DOMContentLoaded", function() {
  
  const productGrid = document.getElementById('category-product-grid');
  const countLabel = document.getElementById('product-count');
  const sortSelect = document.getElementById('sort-select');
  const breadcrumb = document.getElementById('breadcrumb-current');
  const filterListContainer = document.getElementById('category-filter-list');
  
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

      // --- THE FIX: ADAPTER ---
      // We convert the DB format to match exactly what your old 'products.js' had.
      // This ensures your generic card design works without changes.
      currentProducts = dbData.map(p => ({
        ...p, // Keep all properties
        // 1. Fix Image: If DB has 'gallery', use the first image as 'image'
        image: (p.gallery && p.gallery.length > 0) ? p.gallery[0] : (p.image || './assets/images/products/1.jpg'),
        // 2. Fix ID: Ensure 'id' exists (MongoDB uses '_id')
        id: p.id || p._id,
        // 3. Ensure price is a number for sorting
        price: Number(p.price),
        original_price: Number(p.original_price)
      }));
      
      // Now we pass this "clean" data to your existing functions
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

  function filterAndRender() {
    let filtered = [...currentProducts];

    // Filter Logic
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

    const min = document.getElementById('min-price').value;
    const max = document.getElementById('max-price').value;
    if(min) filtered = filtered.filter(p => p.price >= min);
    if(max) filtered = filtered.filter(p => p.price <= max);

    if(document.getElementById('filter-sale').checked) {
      filtered = filtered.filter(p => (p.original_price && p.price < p.original_price) || (p.badges && p.badges.some(b => b.text.toLowerCase() === 'sale')));
    }
    if(document.getElementById('filter-new').checked) {
      filtered = filtered.filter(p => p.is_new_arrival);
    }

    const sortValue = sortSelect.value;
    if(sortValue === 'price-low') filtered.sort((a,b) => a.price - b.price);
    if(sortValue === 'price-high') filtered.sort((a,b) => b.price - a.price);
    if(sortValue === 'newest') filtered.sort((a,b) => (b.is_new_arrival === true) - (a.is_new_arrival === true));

    countLabel.innerText = filtered.length;
    renderGrid(filtered);
  }

  function renderGrid(list) {
    if (list.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">No products found.</p>';
      return;
    }
    // CALL YOUR EXISTING FUNCTION
    // We check if the function exists to prevent crashing
    if (typeof generateProductCard === 'function') {
        productGrid.innerHTML = list.map(product => generateProductCard(product)).join('');
    } else {
        console.error("generateProductCard function is missing! Did you delete it with products.js?");
        productGrid.innerHTML = '<p style="color:red">Error: Design function missing.</p>';
    }
  }

  sortSelect.addEventListener('change', filterAndRender);
  document.getElementById('apply-price').addEventListener('click', filterAndRender);
  document.getElementById('filter-sale').addEventListener('change', filterAndRender);
  document.getElementById('filter-new').addEventListener('change', filterAndRender);
});