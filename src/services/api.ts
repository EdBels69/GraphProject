import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    get: async <T>(url: string, config = {}) => {
        const response = await axiosInstance.get<T>(url, config);
        return response.data;
    },
    post: async <T>(url: string, data = {}, config = {}) => {
        const response = await axiosInstance.post<T>(url, data, config);
        return response.data;
    },
    put: async <T>(url: string, data = {}, config = {}) => {
        const response = await axiosInstance.put<T>(url, data, config);
        return response.data;
    },
    delete: async <T>(url: string, config = {}) => {
        const response = await axiosInstance.delete<T>(url, config);
        return response.data;
    },
    patch: async <T>(url: string, data = {}, config = {}) => {
        const response = await axiosInstance.patch<T>(url, data, config);
        return response.data;
    }
};

export default api;
