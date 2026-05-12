async function loadCart() {
    if (!getToken()) {
        document.getElementById('cartContent').innerHTML = '<p>Please login to view your cart.</p>';
        return;
    }
    
    try {
        const cart = await apiCall('/orders/cart/');
        renderCart(cart);
    } catch (e) {
        document.getElementById('cartContent').innerHTML = '<p>Your cart is empty or could not be loaded.</p>';
    }
}

function renderCart(cart) {
    const container = document.getElementById('cartContent');
    const totalDiv = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cart.items || cart.items.length === 0) {
        container.innerHTML = '<p>Your cart is currently empty.</p>';
        totalDiv.style.display = 'none';
        checkoutBtn.style.display = 'none';
        return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="border-bottom: 2px solid #ddd; text-align: left;"><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr>';
    
    let total = 0;
    cart.items.forEach(item => {
        const price = parseFloat(item.product_details.price);
        const subtotal = price * item.quantity;
        total += subtotal;
        
        html += `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px 0;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.product_details.image || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit: contain;">
                    <span>${item.product_details.name}</span>
                </div>
            </td>
            <td>₹ ${price.toFixed(2)}</td>
            <td>
                <span>${item.quantity}</span>
            </td>
            <td>₹ ${subtotal.toFixed(2)}</td>
            <td>
                <button onclick="removeFromCart(${item.id})" style="color: red; border: none; background: none; cursor: pointer; font-size: 18px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    html += '</table>';
    
    container.innerHTML = html;
    document.getElementById('totalPrice').innerText = total.toFixed(2);
    totalDiv.style.display = 'block';
    checkoutBtn.style.display = 'inline-block';
}

async function removeFromCart(itemId) {
    try {
        await apiCall(`/orders/cart/remove/${itemId}/`, 'POST');
        loadCart();
    } catch (e) {
        alert("Could not remove item.");
    }
}

window.onload = loadCart;
