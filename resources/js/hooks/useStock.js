import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Cache configuration
const CACHE_KEY = "stock_data_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit dalam milliseconds

// Helper functions untuk cache
const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Jika cache masih valid (kurang dari cache duration)
        if (now - timestamp < CACHE_DURATION) {
            return data;
        }

        // Cache expired, hapus
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

export const useStock = () => {
    const [stocks, setStocks] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately
    useEffect(() => {
        const cachedStocks = getCachedData(`${CACHE_KEY}_stocks`);
        const cachedAlerts = getCachedData(`${CACHE_KEY}_alerts`);
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);

        if (cachedStocks || cachedAlerts || cachedCategories) {
            if (cachedStocks) {
                setStocks(cachedStocks);
                hasInitialData.current = true;
            }
            if (cachedAlerts) {
                setLowStockAlerts(cachedAlerts);
            }
            if (cachedCategories) {
                setCategories(cachedCategories);
            }
            // Set loading ke false jika ada cached data, jadi tidak ada loading state
            if (cachedStocks) {
                setLoading(false);
            }
        }
    }, []);

    const fetchStocks = async (forceRefresh = false) => {
        // Jika ada cached data dan tidak force refresh, skip loading
        if (!forceRefresh && hasInitialData.current) {
            // Background refresh - update data tanpa loading state
            try {
                const response = await axios.get("/api/stocks");
                if (response.data.success) {
                    setStocks(response.data.data);
                    setCachedData(`${CACHE_KEY}_stocks`, response.data.data);
                }
            } catch (err) {
                console.error("Error fetching stocks:", err);
                // Jika error, tetap gunakan cached data
            }
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get("/api/stocks");
            if (response.data.success) {
                setStocks(response.data.data);
                setCachedData(`${CACHE_KEY}_stocks`, response.data.data);
                hasInitialData.current = true;
            }
        } catch (err) {
            console.error("Error fetching stocks:", err);
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengambil data stok"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStockAlerts = async (forceRefresh = false) => {
        const cachedAlerts = getCachedData(`${CACHE_KEY}_alerts`);
        if (!forceRefresh && cachedAlerts) {
            // Background refresh
            try {
                const response = await axios.get(
                    "/api/stocks/low-stock/alerts"
                );
                if (response.data.success) {
                    setLowStockAlerts(response.data.data);
                    setCachedData(`${CACHE_KEY}_alerts`, response.data.data);
                }
            } catch (err) {
                console.error("Error fetching low stock alerts:", err);
            }
            return;
        }

        try {
            const response = await axios.get("/api/stocks/low-stock/alerts");
            if (response.data.success) {
                setLowStockAlerts(response.data.data);
                setCachedData(`${CACHE_KEY}_alerts`, response.data.data);
            }
        } catch (err) {
            console.error("Error fetching low stock alerts:", err);
        }
    };

    const fetchCategories = async (forceRefresh = false) => {
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);
        if (!forceRefresh && cachedCategories) {
            // Background refresh
            try {
                const response = await axios.get("/api/stocks/categories/list");
                if (response.data.success) {
                    setCategories(response.data.data);
                    setCachedData(
                        `${CACHE_KEY}_categories`,
                        response.data.data
                    );
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
            return;
        }

        try {
            const response = await axios.get("/api/stocks/categories/list");
            if (response.data.success) {
                setCategories(response.data.data);
                setCachedData(`${CACHE_KEY}_categories`, response.data.data);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const createStock = async (stockData) => {
        try {
            const response = await axios.post("/api/stocks", stockData);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_stocks`);
                localStorage.removeItem(`${CACHE_KEY}_alerts`);
                await fetchStocks(true); // Force refresh
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menambahkan stok";
            return { success: false, message: errorMessage };
        }
    };

    const updateStock = async (id, stockData) => {
        try {
            const response = await axios.put(`/api/stocks/${id}`, stockData);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_stocks`);
                localStorage.removeItem(`${CACHE_KEY}_alerts`);
                await fetchStocks(true); // Force refresh
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat memperbarui stok";
            return { success: false, message: errorMessage };
        }
    };

    const deleteStock = async (id) => {
        try {
            const response = await axios.delete(`/api/stocks/${id}`);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_stocks`);
                localStorage.removeItem(`${CACHE_KEY}_alerts`);
                await fetchStocks(true); // Force refresh
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menghapus stok";
            return { success: false, message: errorMessage };
        }
    };

    const refreshData = () => {
        // Force refresh semua data
        fetchStocks(true);
        fetchLowStockAlerts(true);
    };

    useEffect(() => {
        // Cek apakah ada cached data terlebih dahulu
        const cachedStocks = getCachedData(`${CACHE_KEY}_stocks`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedStocks) {
            fetchStocks(true);
        } else {
            fetchStocks(false); // Background refresh
        }

        fetchLowStockAlerts(false); // Always try background refresh for alerts
        fetchCategories(false); // Always try background refresh for categories
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
        refreshData,
    };
};
