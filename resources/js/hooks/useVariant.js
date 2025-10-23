import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useVariant = () => {
    const { isAuthenticated } = useAuth();
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVariants = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/variants');
            if (response.data.success) {
                setVariants(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching variants:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data varian');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get('/api/variants/products/list');
            if (response.data.success) {
                setProducts(response.data.data);
            } else {
                console.error('Error fetching products:', response.data.message);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchVariants();
        fetchProducts();

        // Set up auto-refresh for variant data
        const intervalId = setInterval(() => {
            fetchVariants();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchVariants, fetchProducts]);

    const createVariant = async (variantData) => {
        try {
            const response = await axios.post('/api/variants', variantData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menambahkan varian' };
            }
        } catch (err) {
            console.error('Error creating variant:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan varian' };
        }
    };

    const updateVariant = async (id, variantData) => {
        try {
            const response = await axios.put(`/api/variants/${id}`, variantData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal memperbarui varian' };
            }
        } catch (err) {
            console.error('Error updating variant:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat memperbarui varian' };
        }
    };

    const deleteVariant = async (id) => {
        try {
            const response = await axios.delete(`/api/variants/${id}`);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menghapus varian' };
            }
        } catch (err) {
            console.error('Error deleting variant:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus varian' };
        }
    };

    const refreshData = () => {
        fetchVariants();
        fetchProducts();
    };

    return {
        variants,
        products,
        loading,
        error,
        createVariant,
        updateVariant,
        deleteVariant,
        refreshData
    };
};
