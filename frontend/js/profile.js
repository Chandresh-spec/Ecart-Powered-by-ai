async function loadProfile() {
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const profile = await apiCall('/users/profile/');
        document.getElementById('profileDetails').innerHTML = `
            <p><strong>Username:</strong> ${profile.username}</p>
            <p><strong>Email:</strong> ${profile.email}</p>
        `;
    } catch(e) {
        document.getElementById('profileDetails').innerHTML = `Error loading profile`;
    }
}

async function loadOrders() {
    try {
        const data = await apiCall('/orders/history/');
        const orders = data.results || data;
        const container = document.getElementById('orderHistory');
        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found.</p>';
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            html += `<div style="padding: 15px; background: #fff; border: 1px solid #ddd; margin-bottom: 15px; border-radius: 8px;">
                <h4>Order #${order.id} - <span style="color:var(--primary-color)">${order.status}</span></h4>
                <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
                <p>Total: ₹ ${parseFloat(order.total_price).toFixed(2)}</p>
                <div style="margin-top: 10px;">
                    <strong>Items:</strong>
                    <ul style="margin-left: 20px; margin-top: 5px;">`;
            order.items.forEach(item => {
                html += `<li>${item.quantity} x ${item.product_details.name} (₹ ${parseFloat(item.price).toFixed(2)})</li>`;
            });
            html += `</ul></div></div>`;
        });
        container.innerHTML = html;
    } catch(e) {
        document.getElementById('orderHistory').innerHTML = `Error loading orders`;
    }
}

window.onload = () => {
    loadProfile();
    loadOrders();
};
