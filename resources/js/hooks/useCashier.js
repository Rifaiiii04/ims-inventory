import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useCashier = () => {
    const { isAuthenticated } = useAuth();
    const [cashiers, setCashiers] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCashiers = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/cashiers');
            if (response.data.success) {
                setCashiers(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching cashiers:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data kasir');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchStatistics = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get('/api/cashiers/statistics');
            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching cashier statistics:', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCashiers();
        fetchStatistics();

        // Set up auto-refresh for cashier data
        const intervalId = setInterval(() => {
            fetchCashiers();
            fetchStatistics();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchCashiers, fetchStatistics]);

    const createCashier = async (cashierData) => {
        try {
            const response = await axios.post('/api/cashiers', cashierData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menambahkan kasir' };
            }
        } catch (err) {
            console.error('Error creating cashier:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menambahkan kasir' };
        }
    };

    const updateCashier = async (id, cashierData) => {
        try {
            const response = await axios.put(`/api/cashiers/${id}`, cashierData);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal memperbarui kasir' };
            }
        } catch (err) {
            console.error('Error updating cashier:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat memperbarui kasir' };
        }
    };

    const deleteCashier = async (id) => {
        try {
            const response = await axios.delete(`/api/cashiers/${id}`);
            if (response.data.success) {
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message || 'Gagal menghapus kasir' };
            }
        } catch (err) {
            console.error('Error deleting cashier:', err);
            return { success: false, message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus kasir' };
        }
    };

    const refreshData = () => {
        fetchCashiers();
        fetchStatistics();
    };

    return {
        cashiers,
        statistics,
        loading,
        error,
        createCashier,
        updateCashier,
        deleteCashier,
        refreshData
    };
};
