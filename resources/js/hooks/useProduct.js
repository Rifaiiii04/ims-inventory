import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Cache configuration
const CACHE_KEY = "product_data_cache";
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

export const useProduct = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const cachedProducts = getCachedData(`${CACHE_KEY}_products`);
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);
        const cachedIngredients = getCachedData(`${CACHE_KEY}_ingredients`);

        if (cachedProducts || cachedCategories || cachedIngredients) {
            if (cachedProducts) {
                setProducts(cachedProducts);
                hasInitialData.current = true;
            }
            if (cachedCategories) {
                setCategories(cachedCategories);
            }
            if (cachedIngredients) {
                setIngredients(cachedIngredients);
            }
            // Set loading ke false jika ada cached data
            if (cachedProducts) {
                setLoading(false);
            }
        }
    }, [isAuthenticated]);

    const fetchProducts = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Jika ada cached data dan tidak force refresh, skip loading
            if (!forceRefresh && hasInitialData.current) {
                // Background refresh - update data tanpa loading state
                try {
                    const response = await axios.get("/api/products");
                    if (response.data.success) {
                        setProducts(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_products`,
                            response.data.data
                        );
                    }
                } catch (err) {
                    console.error("Error fetching products:", err);
                    // Jika error, tetap gunakan cached data
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get("/api/products");
                if (response.data.success) {
                    setProducts(response.data.data);
                    setCachedData(`${CACHE_KEY}_products`, response.data.data);
                    hasInitialData.current = true;
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil data produk"
                );
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated]
    );

    const fetchCategories = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) return;

            const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);
            if (!forceRefresh && cachedCategories) {
                // Background refresh
                try {
                    const response = await axios.get(
                        "/api/products/categories/list"
                    );
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
                const response = await axios.get(
                    "/api/products/categories/list"
                );
                if (response.data.success) {
                    setCategories(response.data.data);
                    setCachedData(
                        `${CACHE_KEY}_categories`,
                        response.data.data
                    );
                } else {
                    console.error(
                        "Error fetching categories:",
                        response.data.message
                    );
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        },
        [isAuthenticated]
    );

    const fetchIngredients = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) return;

            const cachedIngredients = getCachedData(`${CACHE_KEY}_ingredients`);
            if (!forceRefresh && cachedIngredients) {
                // Background refresh
                try {
                    const response = await axios.get(
                        "/api/products/ingredients/list"
                    );
                    if (response.data.success) {
                        setIngredients(response.data.data);
                        setCachedData(
                            `${CACHE_KEY}_ingredients`,
                            response.data.data
                        );
                    }
                } catch (err) {
                    console.error("Error fetching ingredients:", err);
                }
                return;
            }

            try {
                const response = await axios.get(
                    "/api/products/ingredients/list"
                );
                if (response.data.success) {
                    setIngredients(response.data.data);
                    setCachedData(
                        `${CACHE_KEY}_ingredients`,
                        response.data.data
                    );
                } else {
                    console.error(
                        "Error fetching ingredients:",
                        response.data.message
                    );
                }
            } catch (err) {
                console.error("Error fetching ingredients:", err);
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
        const cachedProducts = getCachedData(`${CACHE_KEY}_products`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedProducts) {
            fetchProducts(true);
        } else {
            fetchProducts(false); // Background refresh
        }

        fetchCategories(false); // Background refresh
        fetchIngredients(false); // Background refresh

        // Set up auto-refresh untuk product data (hanya background refresh)
        const intervalId = setInterval(() => {
            fetchProducts(false); // Background refresh
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchProducts, fetchCategories, fetchIngredients, isAuthenticated]);

    const createProduct = async (productData) => {
        try {
            const response = await axios.post("/api/products", productData);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_products`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menambahkan produk",
                };
            }
        } catch (err) {
            console.error("Error creating product:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menambahkan produk",
            };
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await axios.put(
                `/api/products/${id}`,
                productData
            );
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_products`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal memperbarui produk",
                };
            }
        } catch (err) {
            console.error("Error updating product:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat memperbarui produk",
            };
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`/api/products/${id}`);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_products`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message: response.data.message || "Gagal menghapus produk",
                };
            }
        } catch (err) {
            console.error("Error deleting product:", err);

            // Handle specific error cases
            if (err.response?.status === 404) {
                return {
                    success: false,
                    message:
                        "Produk tidak ditemukan. Mungkin sudah dihapus sebelumnya.",
                };
            } else if (err.response?.status === 400) {
                return {
                    success: false,
                    message:
                        err.response?.data?.message ||
                        "Produk tidak dapat dihapus karena masih digunakan dalam transaksi atau komposisi.",
                };
            } else if (err.response?.status === 500) {
                return {
                    success: false,
                    message:
                        "Terjadi kesalahan server. Silakan coba lagi atau hubungi administrator.",
                };
            }

            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menghapus produk",
            };
        }
    };

    const refreshData = () => {
        // Force refresh semua data
        fetchProducts(true);
        fetchCategories(true);
        fetchIngredients(true);
    };

    return {
        products,
        categories,
        ingredients,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshData,
    };
};
