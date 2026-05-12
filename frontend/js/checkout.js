let cartTotal = 0;

async function loadSummary() {
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const cart = await apiCall('/orders/cart/');
        if (!cart.items || cart.items.length === 0) {
            alert('Cart is empty');
            window.location.href = 'index.html';
            return;
        }

        cart.items.forEach(item => {
            cartTotal += (parseFloat(item.product_details.price) * item.quantity);
        });
        document.getElementById('checkoutSummary').innerHTML = `Total Amount to Pay: ₹ ${cartTotal.toFixed(2)}`;
    } catch (e) {
        document.getElementById('checkoutSummary').innerHTML = `Error loading summary`;
    }
}

async function placeOrder() {
    const address = document.getElementById('shippingAddress').value.trim();
    if (!address) {
        alert("Please enter a shipping address.");
        return;
    }
    
    const btn = document.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Placing Order...";
    
    try {
        await apiCall('/orders/checkout/', 'POST', { shipping_address: address });
        alert("Order placed successfully!");
        window.location.href = 'profile.html';
    } catch(e) {
        alert("Order failed: " + e.message);
        btn.disabled = false;
        btn.innerText = "Place Order";
    }
}

window.onload = loadSummary;
