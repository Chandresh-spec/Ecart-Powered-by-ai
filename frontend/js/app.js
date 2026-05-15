// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ===== Hero Particles =====
(function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = (Math.random() * 4) + 's';
        p.style.animationDuration = (3 + Math.random() * 3) + 's';
        container.appendChild(p);
    }
})();

// ===== Counter Animation =====
(function animateCounters() {
    document.querySelectorAll('.hero-stat-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!target) return;
        const duration = 2000;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
})();

// ===== Toast =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMsg');
    if (!toast || !msg) return;
    const icon = toast.querySelector('.toast-icon');
    msg.textContent = message;
    toast.className = 'toast ' + type;
    icon.className = 'toast-icon fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Auth State =====
function checkAuthState() {
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    const navCartBtn = document.getElementById('navCartBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!loginBtn) return;

    if (getToken()) {
        loginBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'flex';
        if (navCartBtn) navCartBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        updateCartCount();
    } else {
        loginBtn.style.display = 'flex';
        if (profileBtn) profileBtn.style.display = 'none';
        if (navCartBtn) navCartBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    checkAuthState();
    showToast('Logged out successfully');
    setTimeout(() => window.location.reload(), 800);
}

// ===== Load Categories =====
async function loadCategories() {
    try {
        const data = await apiCall('/products/categories/', 'GET', null, false);
        const categories = data.results || data;
        const list = document.getElementById('categoryList');
        if (!list) return;
        categories.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" class="cat-chip" onclick="filterCategory(${c.id})">${c.name}</a>`;
            list.appendChild(li);
        });
    } catch (e) { console.error("Error loading categories", e); }
}

// ===== Load Products =====
async function loadProducts(categoryId = null, searchQuery = null) {
    try {
        let endpoint = '/products/';
        let params = new URLSearchParams();
        if (categoryId) params.append('category', categoryId);
        if (searchQuery) params.append('search', searchQuery);
        if (params.toString()) endpoint += '?' + params.toString();

        const data = await apiCall(endpoint, 'GET', null, false);
        const products = data.results || data;
        renderProducts(products);
    } catch (e) { console.error("Error loading products", e); }
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!products.length) {
        grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">No products found.</p>';
        return;
    }

    products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = `fadeInUp 0.4s ease-out ${i * 0.05}s both`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/200x180?text=No+Image'}" class="product-img" alt="${p.name}" loading="lazy">
            <div class="product-category">${p.category_name || ''}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.price}</div>
            <button class="product-add" onclick="event.stopPropagation(); addToCart(${p.id})">
                <i class="fas fa-plus"></i> Add to Cart
            </button>
        `;
        card.addEventListener('click', () => {
            window.location.href = 'product.html?id=' + p.id;
        });
        grid.appendChild(card);
    });
}

// ===== Category Filter =====
async function filterCategory(id) {
    // Update active chip
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    await loadProducts(id);
}

// ===== AI Search =====
async function performSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return loadProducts();

    try {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '<p style="color:var(--primary);grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-circle-notch fa-spin"></i> AI is searching...</p>';
        const data = await apiCall('/ai/search/', 'POST', { query: query }, false);
        if (data.results && data.results.length > 0) {
            renderProducts(data.results);
        } else {
            grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">No results found for your query.</p>';
        }
    } catch (e) {
        console.error(e);
        loadProducts(null, query);
    }
}

// ===== Cart =====
async function addToCart(productId) {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }
    try {
        await apiCall('/orders/cart/add/', 'POST', { product_id: productId, quantity: 1 });
        updateCartCount();
        showToast('Added to cart! 🛒', 'success');
    } catch (e) {
        showToast('Could not add to cart.', 'error');
    }
}

async function updateCartCount() {
    if (!getToken()) return;
    try {
        const cart = await apiCall('/orders/cart/');
        let cnt = 0;
        cart.items.forEach(i => { cnt += i.quantity; });
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = cnt;
    } catch (e) {}
}

// ===== Init =====
window.onload = () => {
    checkAuthState();
    loadCategories();
    
    // Check for search query in URL
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
        document.getElementById('searchInput').value = searchQuery;
        performSearch();
    } else {
        loadProducts();
    }
};
