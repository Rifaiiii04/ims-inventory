import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Cache configuration
const CACHE_KEY = "dashboard_data_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milliseconds

// Helper functions untuk cache
const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
            return data;
        }

        localStorage.removeItem(key);
        return null;
    } catch (err) {
        console.error("Error reading cache:", err);
        return null;
    }
};

const setCachedData = (key, data) => {
    try {
        const cache = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cache));
    } catch (err) {
        console.error("Error setting cache:", err);
    }
};

export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        summary: {
            total_products: 0,
            low_stock: 0,
            today_sales: 0,
            top_products: [],
        },
        recent_transactions: [],
        chart_data: [],
    });
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately
    useEffect(() => {
        const cachedDashboard = getCachedData(`${CACHE_KEY}_dashboard`);
        const cachedAlerts = getCachedData(`${CACHE_KEY}_alerts`);

        if (cachedDashboard || cachedAlerts) {
            if (cachedDashboard) {
                setDashboardData(cachedDashboard);
                hasInitialData.current = true;
            }
            if (cachedAlerts) {
                setLowStockAlerts(cachedAlerts);
            }
            if (cachedDashboard) {
                setLoading(false);
            }
        }
    }, []);

    const fetchDashboardData = async (silent = false, forceRefresh = false) => {
        // Jika ada cached data dan tidak force refresh, skip loading
        if (!forceRefresh && silent && hasInitialData.current) {
            // Background refresh - update data tanpa loading state
            try {
                // Fetch dashboard summary
                const summaryResponse = await axios.get(
                    "/api/dashboard/summary"
                );
                if (summaryResponse.data.success) {
                    setDashboardData(summaryResponse.data.data);
                    setCachedData(
                        `${CACHE_KEY}_dashboard`,
                        summaryResponse.data.data
                    );
                }

                // Fetch low stock alerts
                const lowStockResponse = await axios.get(
                    "/api/dashboard/low-stock"
                );
                if (lowStockResponse.data.success) {
                    setLowStockAlerts(lowStockResponse.data.data);
                    setCachedData(
                        `${CACHE_KEY}_alerts`,
                        lowStockResponse.data.data
                    );
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                // Jika error, tetap gunakan cached data
            }
            return;
        }

        try {
            if (!silent) {
                setLoading(true);
            }
            setError(null);

            // Fetch dashboard summary
            const summaryResponse = await axios.get("/api/dashboard/summary");
            if (summaryResponse.data.success) {
                setDashboardData(summaryResponse.data.data);
                setCachedData(
                    `${CACHE_KEY}_dashboard`,
                    summaryResponse.data.data
                );
                hasInitialData.current = true;
            }

            // Fetch low stock alerts
            const lowStockResponse = await axios.get(
                "/api/dashboard/low-stock"
            );
            if (lowStockResponse.data.success) {
                setLowStockAlerts(lowStockResponse.data.data);
                setCachedData(
                    `${CACHE_KEY}_alerts`,
                    lowStockResponse.data.data
                );
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengambil data dashboard"
            );
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const refreshData = () => {
        fetchDashboardData(false, true); // Force refresh dengan loading
    };

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        // Cek apakah ada cached data terlebih dahulu
        const cachedDashboard = getCachedData(`${CACHE_KEY}_dashboard`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedDashboard) {
            fetchDashboardData(false, true); // Initial load dengan loading
        } else {
            fetchDashboardData(true, false); // Background refresh
        }

        // Set up auto-refresh interval (hanya background refresh)
        intervalRef.current = setInterval(() => {
            fetchDashboardData(true, false); // Silent background refresh
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
        error,
    };
};
