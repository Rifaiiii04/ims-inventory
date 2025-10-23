import { useState, useEffect } from 'react';
import axios from 'axios';

export const useStock = () => {
    const [stocks, setStocks] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStocks = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/stocks');
            if (response.data.success) {
                setStocks(response.data.data);
            }

        } catch (err) {
            console.error('Error fetching stocks:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data stok');
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStockAlerts = async () => {
        try {
            const response = await axios.get('/api/stocks/low-stock/alerts');
            if (response.data.success) {
                setLowStockAlerts(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching low stock alerts:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/stocks/categories/list');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const createStock = async (stockData) => {
        try {
            const response = await axios.post('/api/stocks', stockData);
            if (response.data.success) {
                await fetchStocks(); // Refresh data
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menambahkan stok';
            return { success: false, message: errorMessage };
        }
    };

    const updateStock = async (id, stockData) => {
        try {
            const response = await axios.put(`/api/stocks/${id}`, stockData);
            if (response.data.success) {
                await fetchStocks(); // Refresh data
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat memperbarui stok';
            return { success: false, message: errorMessage };
        }
    };

    const deleteStock = async (id) => {
        try {
            const response = await axios.delete(`/api/stocks/${id}`);
            if (response.data.success) {
                await fetchStocks(); // Refresh data
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menghapus stok';
            return { success: false, message: errorMessage };
        }
    };

    const refreshData = () => {
        fetchStocks();
        fetchLowStockAlerts();
    };

    useEffect(() => {
        fetchStocks();
        fetchLowStockAlerts();
        fetchCategories();
    }, []);

    return {
        stocks,
        lowStockAlerts,
        categories,
        loading,
        error,
        createStock,
        updateStock,
        deleteStock,
        refreshData
    };
};
