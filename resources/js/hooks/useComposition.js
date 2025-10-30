import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Cache configuration
const CACHE_KEY = "composition_data_cache";
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

export const useComposition = () => {
    const { isAuthenticated } = useAuth();
    const [compositions, setCompositions] = useState([]);
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
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

        const cachedCompositions = getCachedData(`${CACHE_KEY}_compositions`);
        const cachedVariants = getCachedData(`${CACHE_KEY}_variants`);
        const cachedProducts = getCachedData(`${CACHE_KEY}_products`);
        const cachedIngredients = getCachedData(`${CACHE_KEY}_ingredients`);

        if (
            cachedCompositions ||
            cachedVariants ||
            cachedProducts ||
            cachedIngredients
        ) {
            if (cachedCompositions) {
                setCompositions(cachedCompositions);
                hasInitialData.current = true;
            }
            if (cachedVariants) {
                setVariants(cachedVariants);
            }
            if (cachedProducts) {
                setProducts(cachedProducts);
            }
            if (cachedIngredients) {
                setIngredients(cachedIngredients);
            }
            // Set loading ke false jika ada cached data
            if (cachedCompositions) {
                setLoading(false);
            }
        }
    }, [isAuthenticated]);

    const fetchCompositions = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Jika ada cached data dan tidak force refresh, skip loading
            if (!forceRefresh && hasInitialData.current) {
                // Background refresh - update data tanpa loading state
                try {
                    const response = await axios.get("/api/compositions");
                    if (response.data.success) {
                        const compositionsData = Array.isArray(
                            response.data.data
                        )
                            ? response.data.data
                            : [];
                        setCompositions(compositionsData);
                        setCachedData(
                            `${CACHE_KEY}_compositions`,
                            compositionsData
                        );
                    }
                } catch (err) {
                    console.error("Error fetching compositions:", err);
                    // Jika error, tetap gunakan cached data
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get("/api/compositions");
                if (response.data.success) {
                    const compositionsData = Array.isArray(response.data.data)
                        ? response.data.data
                        : [];
                    setCompositions(compositionsData);
                    setCachedData(
                        `${CACHE_KEY}_compositions`,
                        compositionsData
                    );
                    hasInitialData.current = true;
                } else {
                    setError(response.data.message);
                    setCompositions([]);
                }
            } catch (err) {
                console.error("Error fetching compositions:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil data komposisi"
                );
                setCompositions([]);
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated]
    );

    const fetchVariants = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) return;

            const cachedVariants = getCachedData(`${CACHE_KEY}_variants`);
            if (!forceRefresh && cachedVariants) {
                // Background refresh
                try {
                    const response = await axios.get(
                        "/api/compositions/variants/list"
                    );
                    if (response.data.success) {
                        const variantsData = Array.isArray(response.data.data)
                            ? response.data.data
                            : [];
                        setVariants(variantsData);
                        setCachedData(`${CACHE_KEY}_variants`, variantsData);
                    }
                } catch (err) {
                    console.error("Error fetching variants:", err);
                }
                return;
            }

            try {
                const response = await axios.get(
                    "/api/compositions/variants/list"
                );
                if (response.data.success) {
                    const variantsData = Array.isArray(response.data.data)
                        ? response.data.data
                        : [];
                    setVariants(variantsData);
                    setCachedData(`${CACHE_KEY}_variants`, variantsData);
                } else {
                    console.error(
                        "Error fetching variants:",
                        response.data.message
                    );
                    setVariants([]);
                }
            } catch (err) {
                console.error("Error fetching variants:", err);
                setVariants([]);
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
                    const response = await axios.get("/api/products");
                    if (response.data.success) {
                        const productsData = Array.isArray(response.data.data)
                            ? response.data.data
                            : [];
                        setProducts(productsData);
                        setCachedData(`${CACHE_KEY}_products`, productsData);
                    }
                } catch (err) {
                    console.error("Error fetching products:", err);
                }
                return;
            }

            try {
                const response = await axios.get("/api/products");
                if (response.data.success) {
                    const productsData = Array.isArray(response.data.data)
                        ? response.data.data
                        : [];
                    setProducts(productsData);
                    setCachedData(`${CACHE_KEY}_products`, productsData);
                } else {
                    console.error(
                        "Error fetching products:",
                        response.data.message
                    );
                    setProducts([]);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([]);
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
                        "/api/compositions/ingredients/list"
                    );
                    if (response.data.success) {
                        const ingredientsData = Array.isArray(
                            response.data.data
                        )
                            ? response.data.data
                            : [];
                        setIngredients(ingredientsData);
                        setCachedData(
                            `${CACHE_KEY}_ingredients`,
                            ingredientsData
                        );
                    }
                } catch (err) {
                    console.error("Error fetching ingredients:", err);
                }
                return;
            }

            try {
                const response = await axios.get(
                    "/api/compositions/ingredients/list"
                );
                if (response.data.success) {
                    const ingredientsData = Array.isArray(response.data.data)
                        ? response.data.data
                        : [];
                    setIngredients(ingredientsData);
                    setCachedData(`${CACHE_KEY}_ingredients`, ingredientsData);
                } else {
                    console.error(
                        "Error fetching ingredients:",
                        response.data.message
                    );
                    setIngredients([]);
                }
            } catch (err) {
                console.error("Error fetching ingredients:", err);
                setIngredients([]);
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
        const cachedCompositions = getCachedData(`${CACHE_KEY}_compositions`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedCompositions) {
            fetchCompositions(true);
        } else {
            fetchCompositions(false); // Background refresh
        }

        fetchVariants(false); // Background refresh
        fetchProducts(false); // Background refresh
        fetchIngredients(false); // Background refresh

        // Set up auto-refresh untuk composition data (hanya background refresh)
        const intervalId = setInterval(() => {
            fetchCompositions(false); // Background refresh
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [
        fetchCompositions,
        fetchVariants,
        fetchProducts,
        fetchIngredients,
        isAuthenticated,
    ]);

    const createComposition = async (compositionData) => {
        try {
            const response = await axios.post(
                "/api/compositions",
                compositionData
            );
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_compositions`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menambahkan komposisi",
                };
            }
        } catch (err) {
            console.error("Error creating composition:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menambahkan komposisi",
            };
        }
    };

    const updateComposition = async (id, compositionData) => {
        try {
            const response = await axios.put(
                `/api/compositions/${id}`,
                compositionData
            );
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_compositions`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal memperbarui komposisi",
                };
            }
        } catch (err) {
            console.error("Error updating composition:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat memperbarui komposisi",
            };
        }
    };

    const deleteComposition = async (id) => {
        try {
            const response = await axios.delete(`/api/compositions/${id}`);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_compositions`);
                refreshData();
                return { success: true, message: response.data.message };
            } else {
                return {
                    success: false,
                    message:
                        response.data.message || "Gagal menghapus komposisi",
                };
            }
        } catch (err) {
            console.error("Error deleting composition:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat menghapus komposisi",
            };
        }
    };

    const refreshData = () => {
        // Force refresh semua data
        fetchCompositions(true);
        fetchVariants(true);
        fetchIngredients(true);
    };

    return {
        compositions,
        variants,
        products,
        ingredients,
        loading,
        error,
        createComposition,
        updateComposition,
        deleteComposition,
        refreshData,
    };
};
