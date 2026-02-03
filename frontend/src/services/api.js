// Auto-detect API base URL based on environment
const getApiBaseUrl = () => {
    // If running on localhost, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    // If deployed (Render, Vercel, etc.), use the same origin
    return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API base URL
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌐 Current Location:', window.location.href);

let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

const api = {
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            console.log('API Request:', `${API_BASE_URL}${endpoint}`, config);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            console.log('API Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                let errorMessage = 'Request failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                    // If response is not JSON, try to get text
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch (e2) {
                        errorMessage = `Server error: ${response.status} ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('API Response data:', data);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // Medical chat query
    async sendChatQuery(query, mode = 'medical_report') {
        return this.post('/api/doctor/chat/query', { 
            query, 
            mode 
        });
    },

    // Get medical reports
    async getReports(patientId = null) {
        const endpoint = patientId ? `/api/doctor/reports?patient_id=${patientId}` : '/api/doctor/reports';
        return this.get(endpoint);
    },

    // Get report file
    getReportFileUrl(reportId) {
        return `${API_BASE_URL}/api/doctor/reports/${reportId}/file`;
    },

    // Health check
    async healthCheck() {
        return this.get('/health');
    },

    // Authentication methods
    setAuth(token, user) {
        authToken = token;
        currentUser = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    clearAuth() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },

    isAuthenticated() {
        return !!authToken;
    },

    getCurrentUser() {
        return currentUser;
    },
    
    get baseURL() {
        return API_BASE_URL;
    }
};

export default api;