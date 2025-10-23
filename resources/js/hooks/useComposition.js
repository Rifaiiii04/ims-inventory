import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useComposition = () => {
    const { isAuthenticated } = useAuth();
    const [compositions, setCompositions] = useState([]);
    const [variants, setVariants] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCompositions = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/compositions');
            if (response.data.success) {
                setCompositions(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching compositions:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data komposisi');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchVariants = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get('/api/compositions/variants/list');
            if (response.data.success) {
                setVariants(response.data.data);
            } else {
                console.error('Error fetching variants:', response.data.message);
            }
        } catch (err) {
            console.error('Error fetching variants:', err);
        }
    }, [isAuthenticated]);

    const fetchIngredients = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get('/api/compositions/ingredients/list');
            if (response.data.success) {
                setIngredients(response.data.data);
            } else {
                console.error('Error fetching ingredients:', response.data.message);
            }
        } catch (err) {
            console.error('Error fetching ingredients:', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCompositions();
        fetchVariants();
        fetchIngredients();

        // Set up auto-refresh for composition data
        const intervalId = setInterval(() => {
            fetchCompositions();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchCompositions, fetchVariants, fetchIngredients]);

    const createComposition = async (compositionData) => {
        try {
            const response = await axios.post('/api/compositions', compositionData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menambahkan komposisi' };
            }
        } catch (err) {
            console.error('Error creating composition:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan komposisi' };
        }
    };

    const updateComposition = async (id, compositionData) => {
        try {
            const response = await axios.put(`/api/compositions/${id}`, compositionData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal memperbarui komposisi' };
            }
        } catch (err) {
            console.error('Error updating composition:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat memperbarui komposisi' };
        }
    };

    const deleteComposition = async (id) => {
        try {
            const response = await axios.delete(`/api/compositions/${id}`);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menghapus komposisi' };
            }
        } catch (err) {
            console.error('Error deleting composition:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus komposisi' };
        }
    };

    const refreshData = () => {
        fetchCompositions();
        fetchVariants();
        fetchIngredients();
    };

    return {
        compositions,
        variants,
        ingredients,
        loading,
        error,
        createComposition,
        updateComposition,
        deleteComposition,
        refreshData
    };
};
