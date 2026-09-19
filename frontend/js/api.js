const API_BASE = '/api/v1';

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    
    const defaultHeaders = {
        'Accept': 'application/json'
    };
    
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401 && window.location.pathname.includes('admin')) {
                // Unauthorized admin, redirect to login
                localStorage.removeItem('admin_token');
                window.location.href = '/pages/admin-login.html';
            }
            throw new Error(data.detail || data.error || 'API Request Failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
