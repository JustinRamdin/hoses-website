/* SGL Hose n' Cable Solutions - UI + auth + role/item management */

(function () {
  const STORAGE_KEYS = {
    users: 'sgl_users_v1',
    session: 'sgl_session_v1',
    items: 'sgl_items_v1'
  };

  const ROLES = {
    SUPER: 'super_admin',
    MARKETER: 'marketer'
  };

  const ROLE_LABELS = {
    [ROLES.SUPER]: 'Super User / Admin',
    [ROLES.MARKETER]: 'Marketer'
  };

  const DEFAULT_ADMIN = {
    id: 'user-admin-1',
    username: 'justinramdin',
    password: '8yyncjWKstqd',
    role: ROLES.SUPER,
    approved: true,
    createdAt: new Date().toISOString()
  };

  const seedItems = [
    {
      id: crypto.randomUUID(),
      ownerId: DEFAULT_ADMIN.id,
      name: 'Industrial Hydraulic Hose Assembly',
      category: 'Hydraulic Hoses',
      shortDescription: 'Durable hydraulic hose solutions for heavy equipment and industrial systems.',
      fullDescription: 'High-performance hydraulic hoses for loaders, excavators, trucks, and industrial applications. Available with compatible fittings and adapters based on usage requirements.',
      price: 'TTD 850',
      availability: 'In Stock',
      tags: 'hydraulic, industrial, heavy equipment',
      mainImage: 'https://images.unsplash.com/photo-1581090700227-1e8e8f95f77f?auto=format&fit=crop&w=1200&q=80',
      additionalImages: [],
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      ownerId: DEFAULT_ADMIN.id,
      name: 'Pressure Washer Hose',
      category: 'Pressure Washer',
      shortDescription: 'Pressure washer hoses and couplers for commercial and industrial cleaning jobs.',
      fullDescription: 'Pressure washer hose options with durable construction, plus connectors and fittings for washdown systems in homes, workshops, and industrial environments.',
      price: 'TTD 450',
      availability: 'Low Stock',
      tags: 'pressure washer, cleaning, couplers',
      mainImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      additionalImages: [],
      createdAt: new Date().toISOString()
    }
  ];

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  function getItems() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.items) || '[]'); } catch { return []; }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null'); } catch { return null; }
  }

  function saveSession(session) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function currentUser() {
    const session = getSession();
    if (!session?.id) return null;
    return getUsers().find((u) => u.id === session.id) || null;
  }

  function isAdmin(user) { return user?.role === ROLES.SUPER && user.approved; }

  function canManageItems(user) {
    return user && user.approved && (user.role === ROLES.SUPER || user.role === ROLES.MARKETER);
  }

  function ensureSeedData() {
    const users = getUsers();
    if (!users.length) saveUsers([DEFAULT_ADMIN]);
    const items = getItems();
    if (!items.length) saveItems(seedItems);
  }

  function setupMenuAndYear() {
    const menuBtn = document.querySelector('[data-menu-btn]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }

    const yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('a[data-nav]').forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href === path) a.setAttribute('aria-current', 'page');
    });
  }

  function mountAuthButtons() {
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;

    const user = currentUser();
    const authWrap = document.createElement('div');
    authWrap.className = 'auth-links';

    if (!user) {
      authWrap.innerHTML = `
        <a class="btn btn-small" href="auth.html?mode=signup">Sign Up</a>
        <a class="btn btn-primary btn-small" href="auth.html?mode=login">Log In</a>
      `;
    } else {
      authWrap.innerHTML = `
        <a class="btn btn-small" href="dashboard.html">Dashboard</a>
        <button class="btn btn-primary btn-small" type="button" data-logout>Log Out</button>
      `;
      authWrap.querySelector('[data-logout]')?.addEventListener('click', () => {
        clearSession();
        location.href = 'index.html';
      });
    }

    navCta.append(authWrap);
  }

  function initLiveStatus() {
    document.querySelectorAll('[data-open-status]').forEach((node) => {
      const now = new Date();
      const day = now.getDay(); // 0 Sun ... 6 Sat
      const hour = now.getHours();
      const isOpen = day >= 1 && day <= 6 && hour >= 8 && hour < 18;
      const closes = '6:00 PM';
      const opens = '8:00 AM';
      node.innerHTML = `
        <span class="status-dot ${isOpen ? 'is-open' : ''}" aria-hidden="true"></span>
        ${isOpen ? `Open now • closes at ${closes}` : `Closed now • opens at ${opens}`}
      `;
    });
  }

  function initContactQuoteForm() {
    const form = document.querySelector('[data-quote-form]');
    const msg = document.querySelector('[data-form-msg]');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const category = String(data.get('category') || '').trim();
      const urgency = String(data.get('urgency') || '').trim();
      const location = String(data.get('location') || '').trim();
      const details = String(data.get('details') || '').trim();

      if (!name || !category || !details) {
        if (msg) msg.textContent = 'Please fill in your name, category, and details.';
        return;
      }

      const text =
`Hi SGL, I need a quote.
Name: ${name}
Phone/WhatsApp: ${phone || 'Not provided'}
Category: ${category}
Urgency: ${urgency || 'Standard'}
Location: ${location || 'Not provided'}
Details: ${details}`;

      const whatsappUrl = `https://wa.me/18687017720?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener');
      if (msg) msg.textContent = 'Great — WhatsApp opened with your prefilled request.';
      form.reset();
    });
  }

  function initAuthPage() {
    const authRoot = document.querySelector('[data-auth-root]');
    if (!authRoot) return;

    const loginForm = authRoot.querySelector('[data-login-form]');
    const signupForm = authRoot.querySelector('[data-signup-form]');
    const loginMsg = authRoot.querySelector('[data-login-msg]');
    const signupMsg = authRoot.querySelector('[data-signup-msg]');

    const mode = new URLSearchParams(location.search).get('mode');
    if (mode === 'signup') {
      authRoot.classList.add('show-signup');
    }

    authRoot.querySelectorAll('[data-switch-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        authRoot.classList.toggle('show-signup', btn.getAttribute('data-switch-mode') === 'signup');
      });
    });

    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = String(new FormData(loginForm).get('username') || '').trim();
      const password = String(new FormData(loginForm).get('password') || '');
      const user = getUsers().find((u) => u.username === username && u.password === password);

      if (!user) {
        loginMsg.textContent = 'Invalid username or password.';
        return;
      }

      if (!user.approved) {
        loginMsg.textContent = 'Your account is pending approval by a super user.';
        return;
      }

      saveSession({ id: user.id, username: user.username });
      location.href = 'dashboard.html';
    });

    signupForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(signupForm);
      const username = String(data.get('username') || '').trim();
      const password = String(data.get('password') || '');
      const role = String(data.get('role') || ROLES.MARKETER);

      if (!username || !password) {
        signupMsg.textContent = 'Username and password are required.';
        return;
      }

      const users = getUsers();
      if (users.some((u) => u.username === username)) {
        signupMsg.textContent = 'That username is already in use.';
        return;
      }

      users.push({
        id: crypto.randomUUID(),
        username,
        password,
        role,
        approved: false,
        createdAt: new Date().toISOString()
      });
      saveUsers(users);
      signupForm.reset();
      signupMsg.textContent = 'Account created. A super user must approve your account before login.';
    });
  }

  async function filesToDataURLs(fileList) {
    const files = Array.from(fileList || []);
    const loaders = files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    }));
    return Promise.all(loaders);
  }

  function renderItemsGrid(items, container) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p class="section-sub">No catalog items yet. Please check back soon.</p>';
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="catalog-card">
        <img src="${item.mainImage || 'assets/images/sgl-logo.png'}" alt="${item.name}" loading="lazy" />
        <div class="catalog-body">
          <p class="kicker">${item.category || 'General'}</p>
          <h3>${item.name}</h3>
          <p>${item.shortDescription || ''}</p>
          <a class="btn btn-small" href="item.html?id=${encodeURIComponent(item.id)}">View Item</a>
        </div>
      </article>
    `).join('');
  }

  
  function normalizeStockStatus(rawValue) {
    const value = String(rawValue || '').toLowerCase();
    if (value.includes('out')) return 'out_of_stock';
    if (value.includes('low')) return 'low_stock';
    if (value.includes('in stock') || value.includes('available')) return 'in_stock';
    return 'in_stock';
  }

  function stockLabel(status) {
    return {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock'
    }[status] || 'In Stock';
  }

  function parseNumericPrice(priceValue) {
    const numeric = parseFloat(String(priceValue || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  }

  function renderAllItemsGrid(items, container) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p class="section-sub">No matching items found. Try adjusting your search or filters.</p>';
      return;
    }

    container.innerHTML = items.map((item) => {
      const stockStatus = normalizeStockStatus(item.availability);
      const priceText = item.price || 'Price on request';
      return `
        <article class="catalog-card catalog-card-rich">
          <img src="${item.mainImage || 'assets/images/sgl-logo.png'}" alt="${item.name}" loading="lazy" />
          <div class="catalog-body">
            <div class="catalog-meta-row">
              <p class="kicker">${item.category || 'General'}</p>
              <span class="stock-pill ${stockStatus}">${stockLabel(stockStatus)}</span>
            </div>
            <h3>${item.name}</h3>
            <p>${item.shortDescription || 'Please contact us for item details.'}</p>
            <p class="catalog-price">${priceText}</p>
            <a class="btn btn-small" href="item.html?id=${encodeURIComponent(item.id)}">View Item</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function initAllItemsPage() {
    const root = document.querySelector('[data-all-items-page]');
    if (!root) return;

    const searchInput = root.querySelector('[data-catalog-search]');
    const categoryFilter = root.querySelector('[data-catalog-filter="category"]');
    const stockFilter = root.querySelector('[data-catalog-filter="stock"]');
    const priceFilter = root.querySelector('[data-catalog-filter="price"]');
    const results = root.querySelector('[data-catalog-results]');
    const grid = root.querySelector('[data-all-items-grid]');

    const items = getItems().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const categories = [...new Set(items.map((item) => String(item.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter?.append(option);
    });

    function applyFilters() {
      const query = String(searchInput?.value || '').trim().toLowerCase();
      const selectedCategory = String(categoryFilter?.value || 'all');
      const selectedStock = String(stockFilter?.value || 'all');
      const selectedPrice = String(priceFilter?.value || 'all');

      const filtered = items.filter((item) => {
        const haystack = [item.name, item.shortDescription, item.fullDescription, item.category, item.tags]
          .map((value) => String(value || '').toLowerCase())
          .join(' ');

        const stockStatus = normalizeStockStatus(item.availability);
        const numericPrice = parseNumericPrice(item.price);

        const matchesQuery = !query || haystack.includes(query);
        const matchesCategory = selectedCategory === 'all' || (item.category || '') === selectedCategory;
        const matchesStock = selectedStock === 'all' || stockStatus === selectedStock;
        const matchesPrice = selectedPrice === 'all'
          || (selectedPrice === 'priced' && numericPrice !== null)
          || (selectedPrice === 'unpriced' && numericPrice === null)
          || (selectedPrice === 'under_500' && numericPrice !== null && numericPrice < 500)
          || (selectedPrice === '500_1000' && numericPrice !== null && numericPrice >= 500 && numericPrice <= 1000)
          || (selectedPrice === '1000_plus' && numericPrice !== null && numericPrice > 1000);

        return matchesQuery && matchesCategory && matchesStock && matchesPrice;
      });

      if (results) {
        const noun = filtered.length === 1 ? 'item' : 'items';
        results.textContent = `${filtered.length} ${noun} shown`;
      }
      renderAllItemsGrid(filtered, grid);
    }

    [searchInput, categoryFilter, stockFilter, priceFilter].forEach((el) => {
      el?.addEventListener('input', applyFilters);
      el?.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function initProductsPage() {
    const container = document.querySelector('[data-catalog-grid]');
    if (!container) return;
    const items = getItems().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    renderItemsGrid(items, container);
  }

  function initItemPage() {
    const itemRoot = document.querySelector('[data-item-detail]');
    if (!itemRoot) return;

    const id = new URLSearchParams(location.search).get('id');
    const item = getItems().find((i) => i.id === id);
    if (!item) {
      itemRoot.innerHTML = '<div class="card"><h1>Item not found</h1><p>The requested item does not exist.</p></div>';
      return;
    }

    const gallery = [item.mainImage, ...(item.additionalImages || [])].filter(Boolean);
    itemRoot.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="item-detail-layout">
            <div class="item-gallery">
              ${gallery.map((src) => `<img src="${src}" alt="${item.name}" loading="lazy" />`).join('')}
            </div>
            <div class="card">
              <p class="kicker">${item.category || 'General'}</p>
              <h1>${item.name}</h1>
              <p>${item.fullDescription || item.shortDescription || ''}</p>
              <p><strong>Availability:</strong> ${item.availability || 'Please contact for availability'}</p>
              ${item.price ? `<p><strong>Display Price:</strong> ${item.price}</p>` : ''}
              ${item.tags ? `<p><strong>Tags:</strong> ${item.tags}</p>` : ''}
              <div class="callout"><strong>Available in store only.</strong> Please contact or visit us for purchase. No online checkout is provided.</div>
              <div class="hero-actions">
                <a class="btn btn-primary" href="contact.html">Contact Us</a>
                <a class="btn" href="products.html">Back to Items</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function initDashboardPage() {
    const root = document.querySelector('[data-dashboard]');
    if (!root) return;

    const user = currentUser();
    if (!canManageItems(user)) {
      location.href = 'auth.html?mode=login';
      return;
    }

    const usersPanel = root.querySelector('[data-users-panel]');
    const itemsPanel = root.querySelector('[data-items-panel]');
    const itemForm = root.querySelector('[data-item-form]');
    const itemMsg = root.querySelector('[data-item-msg]');

    root.querySelector('[data-dashboard-user]').textContent = `${user.username} (${ROLE_LABELS[user.role] || user.role})`;

    function renderUsers() {
      if (!isAdmin(user)) {
        usersPanel.innerHTML = '<p class="section-sub">User management is available only to Super User / Admin.</p>';
        return;
      }

      const users = getUsers();
      usersPanel.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${users.map((u) => `
                <tr>
                  <td>${u.username}</td>
                  <td>
                    <select data-role-user="${u.id}" ${u.id === user.id ? 'disabled' : ''}>
                      <option value="${ROLES.SUPER}" ${u.role === ROLES.SUPER ? 'selected' : ''}>${ROLE_LABELS[ROLES.SUPER]}</option>
                      <option value="${ROLES.MARKETER}" ${u.role === ROLES.MARKETER ? 'selected' : ''}>${ROLE_LABELS[ROLES.MARKETER]}</option>
                    </select>
                  </td>
                  <td>${u.approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    ${u.id !== user.id ? `<button class="btn btn-small" data-approve-user="${u.id}">${u.approved ? 'Revoke' : 'Approve'}</button>` : '<em>Current User</em>'}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;

      usersPanel.querySelectorAll('[data-role-user]').forEach((select) => {
        select.addEventListener('change', () => {
          const usersData = getUsers();
          const target = usersData.find((u) => u.id === select.getAttribute('data-role-user'));
          if (!target) return;
          target.role = select.value;
          saveUsers(usersData);
          renderUsers();
        });
      });

      usersPanel.querySelectorAll('[data-approve-user]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const usersData = getUsers();
          const target = usersData.find((u) => u.id === btn.getAttribute('data-approve-user'));
          if (!target) return;
          target.approved = !target.approved;
          saveUsers(usersData);
          renderUsers();
        });
      });
    }

    function renderItemsAdmin() {
      const items = getItems().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const editable = items.filter((item) => isAdmin(user) || item.ownerId === user.id);

      itemsPanel.innerHTML = editable.length
        ? editable.map((item) => `
            <article class="manage-card">
              <img src="${item.mainImage || 'assets/images/sgl-logo.png'}" alt="${item.name}" />
              <div>
                <h4>${item.name}</h4>
                <p>${item.category || 'General'} • ${item.availability || 'Availability not set'}</p>
                <div class="hero-actions">
                  <button class="btn btn-small" data-delete-item="${item.id}">Delete</button>
                </div>
              </div>
            </article>`).join('')
        : '<p class="section-sub">No items created by your account yet.</p>';

      itemsPanel.querySelectorAll('[data-delete-item]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-delete-item');
          const itemsData = getItems().filter((item) => {
            if (item.id !== id) return true;
            return !isAdmin(user) && item.ownerId !== user.id;
          });
          saveItems(itemsData);
          renderItemsAdmin();
        });
      });
    }

    itemForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(itemForm);
      const mainFile = itemForm.querySelector('[name="mainImageFile"]').files?.[0];
      const extraFiles = itemForm.querySelector('[name="additionalImageFiles"]').files;

      const mainImageData = mainFile ? (await filesToDataURLs([mainFile]))[0] : String(data.get('mainImage') || '');
      const additionalImageData = await filesToDataURLs(extraFiles);

      const item = {
        id: crypto.randomUUID(),
        ownerId: user.id,
        name: String(data.get('name') || '').trim(),
        category: String(data.get('category') || '').trim(),
        shortDescription: String(data.get('shortDescription') || '').trim(),
        fullDescription: String(data.get('fullDescription') || '').trim(),
        price: String(data.get('price') || '').trim(),
        availability: String(data.get('availability') || '').trim(),
        tags: String(data.get('tags') || '').trim(),
        mainImage: mainImageData,
        additionalImages: additionalImageData,
        createdAt: new Date().toISOString()
      };

      if (!item.name || !item.shortDescription) {
        itemMsg.textContent = 'Item name and short description are required.';
        return;
      }

      const items = getItems();
      items.push(item);
      saveItems(items);
      itemForm.reset();
      itemMsg.textContent = 'Item saved successfully.';
      renderItemsAdmin();
    });

    renderUsers();
    renderItemsAdmin();
  }

  ensureSeedData();
  setupMenuAndYear();
  initLiveStatus();
  initContactQuoteForm();
  mountAuthButtons();
  initAuthPage();
  initProductsPage();
  initAllItemsPage();
  initItemPage();
  initDashboardPage();
})();
