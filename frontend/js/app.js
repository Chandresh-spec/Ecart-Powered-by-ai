// Auth Modal Logic
function toggleAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
    
    if(tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

// Authentication Handlers
async function handleLogin(e) {
    e.preventDefault();
    const l_username = document.getElementById('l_username').value;
    const l_password = document.getElementById('l_password').value;
    
    try {
        const data = await apiCall('/users/login/', 'POST', { username: l_username, password: l_password }, false);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        toggleAuthModal();
        checkAuthState();
    } catch (e) {
        alert("Login Failed: \n" + e.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('r_username').value;
    const email = document.getElementById('r_email').value;
    const password = document.getElementById('r_password').value;
    
    try {
        await apiCall('/users/register/', 'POST', { username, email, password }, false);
        alert("Registration successful! Please login.");
        switchAuthTab('login');
    } catch (e) {
        alert("Registration Failed: \n" + e.message);
    }
}

function checkAuthState() {
    if (getToken()) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('navCartBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        updateCartCount();
    } else {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('navCartBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    checkAuthState();
    window.location.reload();
}

// Load Content
async function loadCategories() {
    try {
        const data = await apiCall('/products/categories/', 'GET', null, false);
        const categories = data.results || data; 
        const list = document.getElementById('categoryList');
        categories.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" onclick="filterCategory(${c.id})">${c.name}</a>`;
            list.appendChild(li);
        });
    } catch (e) { console.error("Error loading categories", e); }
}

async function loadProducts(categoryId = null, searchQuery = null) {
    try {
        let endpoint = '/products/';
        let params = new URLSearchParams();
        if (categoryId) params.append('category', categoryId);
        if (searchQuery) params.append('search', searchQuery);
        
        if (params.toString()) {
            endpoint += '?' + params.toString();
        }
        
        const data = await apiCall(endpoint, 'GET', null, false);
        const products = data.results || data;
        renderProducts(products);
    } catch (e) { console.error("Error loading products", e); }
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/200?text=No+Image'}" class="product-img" alt="${p.name}">
            <div class="product-category">${p.category_name || ''}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">₹ ${p.price}</div>
            <button class="product-add" onclick="addToCart(${p.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

async function filterCategory(id) {
    await loadProducts(id);
}

async function performSearch() {
    const query = document.getElementById('searchInput').value;
    if(!query) return loadProducts();
    
    // AI Search endpoint logic
    try {
        document.getElementById('productGrid').innerHTML = '<p>AI is searching...</p>';
        const data = await apiCall('/ai/search/', 'POST', { query: query }, false);
        if (data.results && data.results.length > 0) {
            renderProducts(data.results);
            if(data.ai_keywords) {
                console.log('AI Extraction:', data.ai_keywords);
            }
        } else {
            document.getElementById('productGrid').innerHTML = '<p>No results found for your query.</p>';
        }
    } catch(e) {
        console.error(e);
        // Fallback to normal search
        loadProducts(null, query);
    }
}

async function addToCart(productId) {
    if (!getToken()) {
        toggleAuthModal();
        return;
    }
    try {
        await apiCall('/orders/cart/add/', 'POST', { product_id: productId, quantity: 1 });
        updateCartCount();
        alert("Added to Cart!");
    } catch (e) {
        alert("Could not add to cart.");
    }
}

async function updateCartCount() {
    if (!getToken()) return;
    try {
        const cart = await apiCall('/orders/cart/');
        let cnt = 0;
        cart.items.forEach(i => { cnt += i.quantity; });
        document.getElementById('cartCount').textContent = cnt;
    } catch (e) {}
}

window.onload = () => {
    checkAuthState();
    loadCategories();
    loadProducts();
};
