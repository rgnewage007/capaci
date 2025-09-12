import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Interceptor para agregar el token a todas las requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post('/api/auth/refresh', {
                        refreshToken
                    });

                    const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('authToken', newToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }
                    }

                    // Reintentar la request original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh falló, redirigir a login
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No hay refresh token, redirigir a login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;