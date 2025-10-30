import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Cache configuration
const CACHE_KEY = "variant_data_cache";
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

export const useVariant = () => {
    const { isAuthenticated } = useAuth();
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const cachedVariants = getCachedData(`${CACHE_KEY}_variants`);
        const cachedProducts = getCachedData(`${CACHE_KEY}_products`);

        if (cachedVariants || cachedProducts) {
            if (cachedVariants) {
                setVariants(cachedVariants);
                hasInitialData.current = true;
            }
            if (cachedProducts) {
                setProducts(cachedProducts);
            }
            // Set loading ke false jika ada cached data
            if (cachedVariants) {
                setLoading(false);
            }
        }
    }, [isAuthenticated]);

    const fetchVariants = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Jika ada cached data dan tidak force refresh, skip loading
            if (!forceRefresh && hasInitialData.current) {
                // Background refresh - update data tanpa loading state
                try {
                    const response = await axios.get("/api/variants");
                    if (response.data.success) {
                        setVariants(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_variants`,
                            response.data.data
                        );
                    }
                } catch (err) {
                    console.error("Error fetching variants:", err);
                    // Jika error, tetap gunakan cached data
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get("/api/variants");
                if (response.data.success) {
                    setVariants(response.data.data);
                    setCachedData(`${CACHE_KEY}_variants`, response.data.data);
                    hasInitialData.current = true;
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                console.error("Error fetching variants:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil data varian"
                );
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated]
    );

    const fetchProducts = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) return;

            const cachedProducts = getCachedData(`${CACHE_KEY}_products`);
            if (!forceRefresh && cachedProducts) {
                // Background refresh
                try {
                    const response = await axios.get(
                        "/api/variants/products/list"
                    );
                    if (response.data.success) {
                        setProducts(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_products`,
                            response.data.data
                        );
                    }
                } catch (err) {
                    console.error("Error fetching products:", err);
                }
                return;
            }

            try {
                const response = await axios.get("/api/variants/products/list");
                if (response.data.success) {
                    setProducts(response.data.data);
                    setCachedData(`${CACHE_KEY}_products`, response.data.data);
                } else {
                    console.error(
                        "Error fetching products:",
                        response.data.message
                    );
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        },
        [isAuthenticated]
    );

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        // Cek apakah ada cached data terlebih dahulu
        const cachedVariants = getCachedData(`${CACHE_KEY}_variants`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedVariants) {
            fetchVariants(true);
        } else {
            fetchVariants(false); // Background refresh
        }

        fetchProducts(false); // Background refresh

        // Set up auto-refresh untuk variant data (hanya background refresh)
        const intervalId = setInterval(() => {
            fetchVariants(false); // Background refresh
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchVariants, fetchProducts, isAuthenticated]);

    const createVariant = async (variantData) => {
        try {
            const response = await axios.post("/api/variants", variantData);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_variants`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menambahkan varian",
                };
            }
        } catch (err) {
            console.error("Error creating variant:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menambahkan varian",
            };
        }
    };

    const updateVariant = async (id, variantData) => {
        try {
            const response = await axios.put(
                `/api/variants/${id}`,
                variantData
            );
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_variants`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal memperbarui varian",
                };
            }
        } catch (err) {
            console.error("Error updating variant:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat memperbarui varian",
            };
        }
    };

    const deleteVariant = async (id) => {
        try {
            const response = await axios.delete(`/api/variants/${id}`);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_variants`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message || "Gagal menghapus varian",
                };
            }
        } catch (err) {
            console.error("Error deleting variant:", err);

            // Handle specific error cases
            if (err.response?.status === 404) {
                // Refresh data if variant not found (might be already deleted)
                refreshData();
                return {
                    success: false,
                    message:
                        "Varian tidak ditemukan. Mungkin sudah dihapus sebelumnya.",
                };
            } else if (err.response?.status === 400) {
                console.log(
                    "400 Error - Variant cannot be deleted:",
                    err.response?.data?.message
                );
                return {
                    success: false,
                    message:
                        err.response?.data?.message ||
                        "Varian tidak dapat dihapus karena masih digunakan dalam komposisi atau transaksi.",
                };
            }

            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menghapus varian",
            };
        }
    };

    const refreshData = () => {
        // Force refresh semua data
        fetchVariants(true);
        fetchProducts(true);
    };

    return {
        variants,
        products,
        loading,
        error,
        createVariant,
        updateVariant,
        deleteVariant,
        refreshData,
    };
};
