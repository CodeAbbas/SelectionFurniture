document.addEventListener("DOMContentLoaded", function() {
  
  const productGrid = document.getElementById('category-product-grid');
  const countLabel = document.getElementById('product-count');
  const sortSelect = document.getElementById('sort-select');
  const breadcrumb = document.getElementById('breadcrumb-current');
  const filterListContainer = document.getElementById('category-filter-list');
  
  // State
  let currentProducts = [...products]; 
  
  // 1. READ URL PARAMS
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');     
  const urlSubcategory = urlParams.get('subcategory'); 

  // 2. INITIALIZE PAGE
  if (urlCategory) {
    breadcrumb.innerText = urlSubcategory ? `${urlCategory} / ${urlSubcategory}` : urlCategory;
  }
  
  // Build the Rich Tree
  initRichFilters();
  
  // Initial Render
  filterAndRender();

  // --- FUNCTIONS ---

  function initRichFilters() {
    filterListContainer.innerHTML = ''; 
    
    // 1. Build Hierarchy Data Structure
    const hierarchy = {};
    
    products.forEach(p => {
      const pCats = p.categories || (p.category ? [p.category] : []);
      
      pCats.forEach(catName => {
        if (!hierarchy[catName]) {
          hierarchy[catName] = new Set();
        }
        if (p.subcategory) {
          hierarchy[catName].add(p.subcategory);
        }
      });
    });

    // 2. Render HTML Tree
    Object.keys(hierarchy).sort().forEach(cat => {
      const subcats = Array.from(hierarchy[cat]).sort();
      const hasChildren = subcats.length > 0;
      
      const li = document.createElement('li');
      li.className = 'filter-tree-item';
      
      // Expand if active
      const isExpanded = (cat === urlCategory);
      if(isExpanded) li.classList.add('active');

      // Parent Checkbox: Check if URL category matches and NO subcategory is in URL
      const parentChecked = (cat === urlCategory && !urlSubcategory) ? 'checked' : '';

      let html = `
        <div class="filter-tree-parent">
          <div class="filter-group-label">
            <input type="checkbox" class="filter-checkbox cat-filter" value="${cat}" ${parentChecked}>
            <label>${cat}</label>
          </div>
          ${hasChildren ? '<ion-icon name="chevron-down-outline" class="toggle-icon"></ion-icon>' : ''}
        </div>
      `;

      if (hasChildren) {
        html += `<ul class="filter-tree-children">`;
        subcats.forEach(sub => {
          const subChecked = (cat === urlCategory && sub === urlSubcategory) ? 'checked' : '';
          html += `
            <li class="sub-item">
              <input type="checkbox" class="filter-checkbox sub-filter" data-parent="${cat}" value="${sub}" ${subChecked}>
              <label>${sub}</label>
            </li>
          `;
        });
        html += `</ul>`;
      }

      li.innerHTML = html;
      filterListContainer.appendChild(li);

      if (hasChildren) {
        const toggleBtn = li.querySelector('.filter-tree-parent');
        toggleBtn.addEventListener('click', (e) => {
          if (e.target.type !== 'checkbox' && e.target.tagName !== 'LABEL') {
            li.classList.toggle('active');
          }
        });
      }
    });

    // Add Listeners
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
      cb.addEventListener('change', filterAndRender);
    });
  }

  function filterAndRender() {
    let filtered = [...products];

    // --- RICH FILTERING LOGIC (FIXED) ---
    
    // 1. Group active filters by Parent Category
    const activeFilters = {}; 

    // Capture Parent Checkboxes
    document.querySelectorAll('.cat-filter:checked').forEach(cb => {
      const parent = cb.value;
      if (!activeFilters[parent]) activeFilters[parent] = { parentChecked: true, children: new Set() };
      else activeFilters[parent].parentChecked = true;
    });

    // Capture Child Checkboxes
    document.querySelectorAll('.sub-filter:checked').forEach(cb => {
      const parent = cb.dataset.parent;
      const sub = cb.value;
      if (!activeFilters[parent]) activeFilters[parent] = { parentChecked: false, children: new Set() };
      activeFilters[parent].children.add(sub);
    });

    const activeParents = Object.keys(activeFilters);

    if (activeParents.length > 0) {
      filtered = filtered.filter(p => {
        const pCats = p.categories || (p.category ? [p.category] : []);
        
        // Product must match AT LEAST ONE active parent group
        return activeParents.some(parentKey => {
          // 1. Does product belong to this parent category?
          if (!pCats.includes(parentKey)) return false;

          const group = activeFilters[parentKey];

          // 2. CRITICAL FIX: If any children are checked, STRICTLY match children
          if (group.children.size > 0) {
            return p.subcategory && group.children.has(p.subcategory);
          }

          // 3. If no children checked, but parent is checked, Match Parent
          if (group.parentChecked) {
            return true;
          }

          return false;
        });
      });
    }

    // --- PRICE & STATUS FILTERS ---
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

    // --- SORTING ---
    const sortValue = sortSelect.value;
    if(sortValue === 'price-low') filtered.sort((a,b) => a.price - b.price);
    if(sortValue === 'price-high') filtered.sort((a,b) => b.price - a.price);
    if(sortValue === 'newest') filtered.sort((a,b) => (b.is_new_arrival === true) - (a.is_new_arrival === true));

    // RENDER
    countLabel.innerText = filtered.length;
    renderGrid(filtered);
  }

  function renderGrid(list) {
    if (list.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">No products found.</p>';
      return;
    }
    productGrid.innerHTML = list.map(product => generateProductCard(product)).join('');
  }

  // --- LISTENERS ---
  sortSelect.addEventListener('change', filterAndRender);
  document.getElementById('apply-price').addEventListener('click', filterAndRender);
  document.getElementById('filter-sale').addEventListener('change', filterAndRender);
  document.getElementById('filter-new').addEventListener('change', filterAndRender);

});