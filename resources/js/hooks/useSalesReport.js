import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { getCachedData, setCachedData } from "../utils/cacheManager";

const CACHE_KEY = "sales_report";
const CACHE_KEY_PRODUCTS = "sales_report_products";
const CACHE_KEY_CATEGORIES = "sales_report_categories";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for sales report

export const useSalesReport = () => {
    const { isAuthenticated } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately on mount - BEFORE any loading state
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const cachedReport = getCachedData(CACHE_KEY);
        const cachedProducts = getCachedData(CACHE_KEY_PRODUCTS);
        const cachedCategories = getCachedData(CACHE_KEY_CATEGORIES);

        // Load cached data immediately - no loading state needed
        if (cachedReport) {
            setReportData(cachedReport);
            hasInitialData.current = true;
            setLoading(false); // Don't show loading if we have cached data
        }
        if (cachedProducts) {
            setProducts(cachedProducts);
        }
        if (cachedCategories) {
            setCategories(cachedCategories);
        }

        // If no cached data, fetch immediately (with loading)
        if (!cachedReport) {
            setLoading(true);
            // Will be fetched by the useEffect below
        } else {
            // If we have cached data, still fetch in background silently later
            hasInitialData.current = true;
        }
    }, [isAuthenticated]); // Only run when auth changes

    const fetchSalesReport = useCallback(
        async (filters = {}, silent = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Create cache key with filters
            const filterKey = JSON.stringify(filters);
            const cacheKey = `${CACHE_KEY}_${filterKey}`;

            // Check cache first
            const cachedData = getCachedData(cacheKey);
            if (cachedData && !silent) {
                setReportData(cachedData);
                if (!hasInitialData.current) {
                    hasInitialData.current = true;
                    setLoading(false);
                }
                // Still fetch in background to update cache
                silent = true;
            }

            // If no cached data and not silent, show loading
            if (!hasInitialData.current && !silent) {
                setLoading(true);
                setError(null);
            }

            try {
                const params = new URLSearchParams();
                if (filters.product) params.append("product", filters.product);
                if (filters.category)
                    params.append("category", filters.category);
                if (filters.date) params.append("date", filters.date);
                if (filters.payment) params.append("payment", filters.payment);
                if (filters.period) params.append("period", filters.period);

                const response = await axios.get(
                    `/api/reports/sales?${params.toString()}`
                );

                if (response.data.success) {
                    setReportData(response.data.data);
                    setCachedData(cacheKey, response.data.data, CACHE_TTL);
                    hasInitialData.current = true;
                } else {
                    // Only set error if not silent refresh
                    if (!silent) {
                        setError(
                            response.data.message ||
                                "Gagal mengambil data laporan penjualan"
                        );
                    }
                }
            } catch (err) {
                // Only set error if not silent refresh and no cached data
                if (!silent && !cachedData) {
                    console.error("Error fetching sales report:", err);
                    setError(
                        err.response?.data?.message ||
                            "Terjadi kesalahan saat mengambil data laporan penjualan"
                    );
                }
            } finally {
                // Only update loading if not silent refresh
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [isAuthenticated]
    );

    const fetchProducts = useCallback(async (forceRefresh = false) => {
        if (!isAuthenticated) return;
        
        // Check cache first
        const cachedProducts = getCachedData(CACHE_KEY_PRODUCTS);
        if (cachedProducts && !forceRefresh) {
            setProducts(cachedProducts);
            // Fetch in background to update cache
        }

        try {
            const response = await axios.get("/api/products");
            if (response.data.success) {
                setProducts(response.data.data);
                setCachedData(CACHE_KEY_PRODUCTS, response.data.data, CACHE_TTL);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            // If error and no cached data, keep existing state
        }
    }, [isAuthenticated]);

    const fetchCategories = useCallback(async (forceRefresh = false) => {
        if (!isAuthenticated) return;
        
        // Check cache first
        const cachedCategories = getCachedData(CACHE_KEY_CATEGORIES);
        if (cachedCategories && !forceRefresh) {
            setCategories(cachedCategories);
            // Fetch in background to update cache
        }

        try {
            const response = await axios.get("/api/products/categories/list");
            if (response.data.success) {
                setCategories(response.data.data);
                setCachedData(CACHE_KEY_CATEGORIES, response.data.data, CACHE_TTL);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            // If error and no cached data, keep existing state
        }
    }, [isAuthenticated]);

    const exportPDF = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.product) params.append("product", filters.product);
            if (filters.category) params.append("category", filters.category);
            if (filters.date) params.append("date", filters.date);
            if (filters.payment) params.append("payment", filters.payment);
            if (filters.period) params.append("period", filters.period);

            // Get HTML response and open in new window for printing
            const response = await axios.get(
                `/api/reports/sales/export/pdf?${params.toString()}`,
                {
                    responseType: "text",
                }
            );

            // Open HTML in new window for printing
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(response.data);
                printWindow.document.close();
                // Auto trigger print dialog
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            } else {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }

            return { success: true, message: "Laporan berhasil diekspor" };
        } catch (err) {
            console.error("Error exporting PDF:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message || "Gagal mengekspor laporan",
            };
        }
    };

    // Fetch data on mount (only if not loaded from cache)
    useEffect(() => {
        if (!isAuthenticated) return;
        
        // Small delay to ensure cache loading completes first
        const timer = setTimeout(() => {
            if (!hasInitialData.current) {
                // No cached data, fetch with loading
                fetchSalesReport({}, false);
            } else {
                // Has cached data, refresh silently in background
                fetchSalesReport({}, true);
            }
            fetchProducts(false);
            fetchCategories(false);
        }, 0);

        return () => clearTimeout(timer);
    }, [isAuthenticated]); // Only run when auth changes

    // Note: Auto-refresh is handled at component level to use current filters

    return {
        reportData,
        products,
        categories,
        loading,
        error,
        fetchSalesReport,
        exportPDF,
        refreshData: () => {
            fetchSalesReport();
            fetchProducts();
            fetchCategories();
        },
    };
};
