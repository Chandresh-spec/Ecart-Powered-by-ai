// ===== Product Detail Page JS =====

let currentProduct = null;
let selectedRating = 0;
let quantity = 1;

// ===== Get Product ID from URL =====
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ===== Auth State (copied from app.js for standalone use) =====
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
        // Show review form for logged-in users
        const reviewForm = document.getElementById('writeReview');
        if (reviewForm) reviewForm.style.display = 'block';
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
    setTimeout(() => window.location.href = 'index.html', 800);
}

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

// ===== Cart Count =====
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

// ===== Load Product Detail =====
async function loadProductDetail() {
    const productId = getProductId();
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const product = await apiCall(`/products/${productId}/`, 'GET', null, false);
        currentProduct = product;
        renderProductDetail(product);
    } catch (e) {
        console.error('Error loading product:', e);
        document.getElementById('skeletonLoader').innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:80px 24px;">
                <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);margin-bottom:16px;"></i>
                <p style="color:var(--text-muted);font-size:16px;">Product not found. <a href="index.html" style="color:var(--primary);">Go back to shop</a></p>
            </div>
        `;
    }
}

function renderProductDetail(p) {
    // Update page title
    document.title = `${p.name} - GroceryStore`;

    // Breadcrumb
    document.getElementById('breadcrumbProduct').textContent = p.name;

    // Image
    const img = document.getElementById('productImage');
    img.src = p.image || 'https://via.placeholder.com/400x400?text=No+Image';
    img.alt = p.name;

    // Category
    document.getElementById('detailCategory').textContent = p.category_name || 'Grocery';

    // Name
    document.getElementById('detailName').textContent = p.name;

    // Price
    const displayPrice = p.discount_price || p.price;
    document.getElementById('detailPrice').textContent = parseFloat(displayPrice).toFixed(2);

    // Show original price and discount if discount exists
    if (p.discount_price && parseFloat(p.discount_price) < parseFloat(p.price)) {
        const originalEl = document.getElementById('detailOriginalPrice');
        originalEl.textContent = parseFloat(p.price).toFixed(2);
        originalEl.style.display = 'inline';

        const discountPct = Math.round((1 - parseFloat(p.discount_price) / parseFloat(p.price)) * 100);
        const discountTag = document.getElementById('detailDiscountTag');
        discountTag.textContent = `${discountPct}% OFF`;
        discountTag.style.display = 'inline';

        const badge = document.getElementById('imageBadge');
        document.getElementById('discountBadge').textContent = `${discountPct}% OFF`;
        badge.style.display = 'flex';
    }

    // Stock
    const stockEl = document.getElementById('detailStock');
    const stockText = document.getElementById('stockText');
    if (p.stock > 10) {
        stockEl.className = 'detail-stock in-stock';
        stockText.textContent = 'In Stock';
    } else if (p.stock > 0) {
        stockEl.className = 'detail-stock low-stock';
        stockEl.querySelector('i').className = 'fas fa-exclamation-triangle';
        stockText.textContent = `Only ${p.stock} left in stock`;
    } else {
        stockEl.className = 'detail-stock out-of-stock';
        stockEl.querySelector('i').className = 'fas fa-times-circle';
        stockText.textContent = 'Out of Stock';
        document.getElementById('addToCartBtn').disabled = true;
        document.getElementById('addToCartBtn').style.opacity = '0.5';
        document.getElementById('addToCartBtn').style.cursor = 'not-allowed';
        document.getElementById('buyNowBtn').disabled = true;
        document.getElementById('buyNowBtn').style.opacity = '0.5';
    }

    // Description
    document.getElementById('detailDescription').textContent = p.description || 'Fresh and high-quality product delivered straight from the source. Handpicked to ensure the best quality for our customers.';

    // Reviews
    renderReviews(p.reviews || []);

    // Show content, hide skeleton
    document.getElementById('skeletonLoader').style.display = 'none';
    document.getElementById('detailContent').style.display = 'grid';
}

// ===== Reviews =====
function renderReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    const countEl = document.getElementById('reviewCount');

    if (!reviews.length) {
        countEl.textContent = 'No reviews yet';
        container.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comment-dots"></i>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        `;
        return;
    }

    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    countEl.textContent = `${reviews.length} review${reviews.length > 1 ? 's' : ''} · ${avgRating} average`;

    container.innerHTML = reviews.map((r, i) => {
        const stars = Array.from({length: 5}, (_, idx) =>
            `<i class="fas fa-star ${idx < r.rating ? 'filled' : ''}"></i>`
        ).join('');

        const initial = (r.username || 'U')[0].toUpperCase();
        const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

        return `
            <div class="review-card" style="animation-delay: ${i * 0.08}s">
                <div class="review-header">
                    <div class="reviewer">
                        <div class="reviewer-avatar">${initial}</div>
                        <div>
                            <div class="reviewer-name">${r.username || 'Anonymous'}</div>
                            <div class="reviewer-date">${date}</div>
                        </div>
                    </div>
                    <div class="review-stars">${stars}</div>
                </div>
                ${r.comment ? `<p class="review-comment">${r.comment}</p>` : ''}
            </div>
        `;
    }).join('');
}

// ===== Rating Picker =====
function initRatingPicker() {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach((s, idx) => {
                s.classList.toggle('active', idx < selectedRating);
            });
        });

        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, idx) => {
                s.style.color = idx < rating ? '#f59e0b' : '';
            });
        });

        star.addEventListener('mouseleave', () => {
            stars.forEach((s, idx) => {
                s.style.color = s.classList.contains('active') ? '#f59e0b' : '';
            });
        });
    });
}

// ===== Submit Review =====
async function submitReview() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }
    if (selectedRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }

    const comment = document.getElementById('reviewComment').value;
    const productId = getProductId();

    try {
        await apiCall(`/products/${productId}/reviews/`, 'POST', {
            rating: selectedRating,
            comment: comment
        });
        showToast('Review submitted! ⭐', 'success');
        // Reload to show new review
        setTimeout(() => loadProductDetail(), 800);
        // Reset form
        selectedRating = 0;
        document.getElementById('reviewComment').value = '';
        document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
    } catch (e) {
        showToast('Could not submit review', 'error');
    }
}

// ===== Quantity =====
function changeQty(delta) {
    quantity = Math.max(1, Math.min(99, quantity + delta));
    document.getElementById('qtyValue').textContent = quantity;
}

// ===== Add to Cart =====
async function addToCartDetail() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }
    if (!currentProduct) return;

    try {
        await apiCall('/orders/cart/add/', 'POST', {
            product_id: currentProduct.id,
            quantity: quantity
        });
        updateCartCount();
        showToast(`Added ${quantity}x ${currentProduct.name} to cart! 🛒`, 'success');
    } catch (e) {
        showToast('Could not add to cart', 'error');
    }
}

// ===== Buy Now =====
function buyNow() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }
    addToCartDetail().then(() => {
        setTimeout(() => window.location.href = 'checkout.html', 500);
    });
}

// ===== Search redirect =====
function goSearchHome() {
    const query = document.getElementById('searchInput').value;
    if (query) {
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    } else {
        window.location.href = 'index.html';
    }
}

// ===== Navbar Scroll =====
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ===== Init =====
window.onload = () => {
    checkAuthState();
    loadProductDetail();
    initRatingPicker();
};
