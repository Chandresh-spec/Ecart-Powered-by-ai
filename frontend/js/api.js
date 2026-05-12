const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken() {
    return localStorage.getItem('access_token');
}

async function apiCall(endpoint, method = 'GET', data = null, useAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (useAuth && getToken()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        // Handle 401 Unauthorized
        if (response.status === 401 && useAuth) {
            console.error("Unauthorized. Please login again.");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.reload();
        }
        
        let responseData = {};
        if (response.status !== 204) {
            responseData = await response.json().catch(() => ({}));
        }
        
        if (!response.ok) {
            throw new Error(responseData.error || responseData.detail || 'API Error');
        }
        
        return responseData;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}
