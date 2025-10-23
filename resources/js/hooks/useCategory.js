import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCategory = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setError(null);

            const response = await axios.get('/api/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }

        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data kategori');
        }
    };

    const createCategory = async (categoryData) => {
        try {
            const response = await axios.post('/api/categories', categoryData);
            if (response.data.success) {
                await fetchCategories(); // Refresh data
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menambahkan kategori';
            return { success: false, message: errorMessage };
        }
    };

    const updateCategory = async (id, categoryData) => {
        try {
            const response = await axios.put(`/api/categories/${id}`, categoryData);
            if (response.data.success) {
                await fetchCategories(); // Refresh data
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat memperbarui kategori';
            return { success: false, message: errorMessage };
        }
    };

    const deleteCategory = async (id) => {
        try {
            const response = await axios.delete(`/api/categories/${id}`);
            if (response.data.success) {
                await fetchCategories(); // Refresh data
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menghapus kategori';
            return { success: false, message: errorMessage };
        }
    };

    const refreshData = () => {
        fetchCategories();
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshData
    };
};
