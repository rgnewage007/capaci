import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

// Interceptor para agregar token automáticamente
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores de autenticación
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;