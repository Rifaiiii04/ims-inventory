import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        summary: {
            total_products: 0,
            low_stock: 0,
            today_sales: 0,
            top_products: []
        },
        recent_transactions: [],
        chart_data: []
    });
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            setError(null);

            // Fetch dashboard summary
            const summaryResponse = await axios.get('/api/dashboard/summary');
            if (summaryResponse.data.success) {
                setDashboardData(summaryResponse.data.data);
            }

            // Fetch low stock alerts
            const lowStockResponse = await axios.get('/api/dashboard/low-stock');
            if (lowStockResponse.data.success) {
                setLowStockAlerts(lowStockResponse.data.data);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data dashboard');
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const refreshData = () => {
        fetchDashboardData();
    };

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        // Initial fetch
        fetchDashboardData();

        // Set up auto-refresh interval
        intervalRef.current = setInterval(() => {
            fetchDashboardData(true); // Silent refresh
        }, 30000); // 30 seconds

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        dashboardData,
        lowStockAlerts,
        loading,
        error
    };
};
