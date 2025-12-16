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
    const isFetchingAlerts = useRef(false);
    const isFetchingCategories = useRef(false);

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
        // Prevent multiple simultaneous requests
        if (isFetchingAlerts.current && !forceRefresh) {
            return;
        }

        // Wrap in try-catch to prevent unhandled promise rejections
        try {
            await fetchLowStockAlertsInternal(forceRefresh);
        } catch (err) {
            // Silently handle any unhandled errors
            // This prevents React DevTools from logging network errors
        }
    };

    const fetchLowStockAlertsInternal = async (forceRefresh = false) => {
        const cachedAlerts = getCachedData(`${CACHE_KEY}_alerts`);
        if (!forceRefresh && cachedAlerts) {
            // Use cached data immediately
            setLowStockAlerts(cachedAlerts);

            // Background refresh - only if not already refreshing
            const lastRefresh = getCachedData(
                `${CACHE_KEY}_alerts_last_refresh`
            );
            const now = Date.now();
            // Only refresh if last refresh was more than 30 seconds ago
            if (!lastRefresh || now - lastRefresh > 30000) {
                isFetchingAlerts.current = true;
                try {
                    const response = await axios.get(
                        "/api/stocks/low-stock/alerts",
                        { timeout: 5000 } // 5 second timeout
                    );
                    if (response.data.success) {
                        setLowStockAlerts(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_alerts`,
                            response.data.data
                        );
                        setCachedData(`${CACHE_KEY}_alerts_last_refresh`, now);
                    }
                } catch (err) {
                    // Silently fail for background refresh - use cached data
                    // Don't log network errors to avoid console spam
                    const isNetworkError =
                        err.code === "ERR_NETWORK" ||
                        err.code === "ERR_INSUFFICIENT_RESOURCES" ||
                        err.code === "ECONNABORTED" ||
                        err.message?.includes("Network Error") ||
                        err.message?.includes("ERR_INSUFFICIENT_RESOURCES");

                    // Only log non-network errors
                    if (!isNetworkError) {
                        console.error("Error fetching low stock alerts:", err);
                    }
                    // Network errors are silently ignored - cached data is already set
                } finally {
                    isFetchingAlerts.current = false;
                }
            }
            return;
        }

        isFetchingAlerts.current = true;
        try {
            const response = await axios.get("/api/stocks/low-stock/alerts", {
                timeout: 10000, // 10 second timeout
            });
            if (response.data.success) {
                setLowStockAlerts(response.data.data);
                setCachedData(`${CACHE_KEY}_alerts`, response.data.data);
                setCachedData(`${CACHE_KEY}_alerts_last_refresh`, Date.now());
            }
        } catch (err) {
            // Handle network errors silently - use cached data if available
            const isNetworkError =
                err.code === "ERR_NETWORK" ||
                err.code === "ERR_INSUFFICIENT_RESOURCES" ||
                err.code === "ECONNABORTED" ||
                err.message?.includes("Network Error") ||
                err.message?.includes("ERR_INSUFFICIENT_RESOURCES");

            if (isNetworkError) {
                // Silently use cached data if available
                if (cachedAlerts) {
                    setLowStockAlerts(cachedAlerts);
                } else {
                    // No cached data, set empty array silently
                    setLowStockAlerts([]);
                }
                // Don't log network errors - they're expected in some scenarios
            } else {
                // Only log non-network errors (server errors, validation errors, etc.)
                console.error("Error fetching low stock alerts:", err);
                // Set empty array if no cached data available
                if (!cachedAlerts) {
                    setLowStockAlerts([]);
                } else {
                    // Use cached data for non-network errors too
                    setLowStockAlerts(cachedAlerts);
                }
            }
        } finally {
            isFetchingAlerts.current = false;
        }
    };

    const fetchCategories = async (forceRefresh = false) => {
        // Prevent multiple simultaneous requests
        if (isFetchingCategories.current && !forceRefresh) {
            return;
        }

        // Wrap in try-catch to prevent unhandled promise rejections
        try {
            await fetchCategoriesInternal(forceRefresh);
        } catch (err) {
            // Silently handle any unhandled errors
            // This prevents React DevTools from logging network errors
        }
    };

    const fetchCategoriesInternal = async (forceRefresh = false) => {
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);
        if (!forceRefresh && cachedCategories) {
            // Use cached data immediately
            setCategories(cachedCategories);

            // Background refresh - only if not already refreshing
            const lastRefresh = getCachedData(
                `${CACHE_KEY}_categories_last_refresh`
            );
            const now = Date.now();
            // Only refresh if last refresh was more than 30 seconds ago
            if (!lastRefresh || now - lastRefresh > 30000) {
                isFetchingCategories.current = true;
                try {
                    const response = await axios.get(
                        "/api/stocks/categories/list",
                        { timeout: 5000 } // 5 second timeout
                    );
                    if (response.data.success) {
                        setCategories(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_categories`,
                            response.data.data
                        );
                        setCachedData(
                            `${CACHE_KEY}_categories_last_refresh`,
                            now
                        );
                    }
                } catch (err) {
                    // Silently fail for background refresh - use cached data
                    // Don't log network errors to avoid console spam
                    const isNetworkError =
                        err.code === "ERR_NETWORK" ||
                        err.code === "ERR_INSUFFICIENT_RESOURCES" ||
                        err.code === "ECONNABORTED" ||
                        err.message?.includes("Network Error") ||
                        err.message?.includes("ERR_INSUFFICIENT_RESOURCES");

                    // Only log non-network errors
                    if (!isNetworkError) {
                        console.error("Error fetching categories:", err);
                    }
                    // Network errors are silently ignored - cached data is already set
                } finally {
                    isFetchingCategories.current = false;
                }
            }
            return;
        }

        isFetchingCategories.current = true;
        try {
            const response = await axios.get("/api/stocks/categories/list", {
                timeout: 10000, // 10 second timeout
            });
            if (response.data.success) {
                setCategories(response.data.data);
                setCachedData(`${CACHE_KEY}_categories`, response.data.data);
                setCachedData(
                    `${CACHE_KEY}_categories_last_refresh`,
                    Date.now()
                );
            }
        } catch (err) {
            // Handle network errors silently - use cached data if available
            const isNetworkError =
                err.code === "ERR_NETWORK" ||
                err.code === "ERR_INSUFFICIENT_RESOURCES" ||
                err.code === "ECONNABORTED" ||
                err.message?.includes("Network Error") ||
                err.message?.includes("ERR_INSUFFICIENT_RESOURCES");

            if (isNetworkError) {
                // Silently use cached data if available
                if (cachedCategories) {
                    setCategories(cachedCategories);
                } else {
                    // No cached data, set empty array silently
                    setCategories([]);
                }
                // Don't log network errors - they're expected in some scenarios
            } else {
                // Only log non-network errors (server errors, validation errors, etc.)
                console.error("Error fetching categories:", err);
                // Set empty array if no cached data available
                if (!cachedCategories) {
                    setCategories([]);
                } else {
                    // Use cached data for non-network errors too
                    setCategories(cachedCategories);
                }
            }
        } finally {
            isFetchingCategories.current = false;
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
            console.error("Error creating stock:", err.response?.data);
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menambahkan stok";
            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                const errorDetails = Object.values(validationErrors)
                    .flat()
                    .join(", ");
                return {
                    success: false,
                    message: `${errorMessage}: ${errorDetails}`,
                    errors: validationErrors,
                };
            }
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

    const bulkDeleteStock = async (ids) => {
        try {
            const response = await axios.post("/api/stocks/bulk-delete", {
                ids,
            });
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_stocks`);
                localStorage.removeItem(`${CACHE_KEY}_alerts`);
                await fetchStocks(true); // Force refresh
                return {
                    success: true,
                    message: response.data.message,
                    data: response.data.data,
                };
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
        const cachedAlerts = getCachedData(`${CACHE_KEY}_alerts`);
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);

        // Set cached data immediately if available
        if (cachedAlerts) {
            setLowStockAlerts(cachedAlerts);
        }
        if (cachedCategories) {
            setCategories(cachedCategories);
        }

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedStocks) {
            fetchStocks(true);
        } else {
            // Delay background refresh to avoid too many simultaneous requests
            setTimeout(() => {
                fetchStocks(false); // Background refresh
            }, 500);
        }

        // Delay alerts and categories fetch to avoid ERR_INSUFFICIENT_RESOURCES
        // Use longer delays to prevent resource exhaustion
        setTimeout(() => {
            // Only fetch if not already fetching
            if (!isFetchingAlerts.current) {
                fetchLowStockAlerts(false).catch(() => {
                    // Silently ignore errors - cached data is already set
                });
            }
        }, 2000); // Increased delay to 2 seconds

        setTimeout(() => {
            // Only fetch if not already fetching
            if (!isFetchingCategories.current) {
                fetchCategories(false).catch(() => {
                    // Silently ignore errors - cached data is already set
                });
            }
        }, 3000); // Increased delay to 3 seconds
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
        bulkDeleteStock,
        refreshData,
    };
};
