class Auth {
    static async login(username, password) {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: formData
            });
            
            if (data.access_token) {
                localStorage.setItem('admin_token', data.access_token);
                Toast.show('Login successful', 'success');
                setTimeout(() => {
                    window.location.href = '/pages/admin-dashboard.html';
                }, 1000);
            }
        } catch (error) {
            Toast.show(error.message || 'Login failed', 'error');
        }
    }

    static logout() {
        localStorage.removeItem('admin_token');
        window.location.href = '/pages/admin-login.html';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('admin_token');
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/admin-login.html';
        }
    }
}
