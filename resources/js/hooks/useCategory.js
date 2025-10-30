import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Cache configuration
const CACHE_KEY = "category_data_cache";
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

export const useCategory = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasInitialData = useRef(false);

    // Load cached data immediately
    useEffect(() => {
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);

        if (cachedCategories) {
            setCategories(cachedCategories);
            hasInitialData.current = true;
            setLoading(false);
        }
    }, []);

    const fetchCategories = async (forceRefresh = false) => {
        // Jika ada cached data dan tidak force refresh, skip loading
        if (!forceRefresh && hasInitialData.current) {
            // Background refresh - update data tanpa loading state
            try {
                setError(null);

                const response = await axios.get("/api/categories");
                if (response.data.success) {
                    const categoriesData = Array.isArray(response.data.data)
                        ? response.data.data
                        : [];
                    setCategories(categoriesData);
                    setCachedData(`${CACHE_KEY}_categories`, categoriesData);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                // Jika error, tetap gunakan cached data
            }
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get("/api/categories");
            if (response.data.success) {
                const categoriesData = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];
                setCategories(categoriesData);
                setCachedData(`${CACHE_KEY}_categories`, categoriesData);
                hasInitialData.current = true;
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengambil data kategori"
            );
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const createCategory = async (categoryData) => {
        try {
            const response = await axios.post("/api/categories", categoryData);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_categories`);
                await fetchCategories(true);
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menambahkan kategori";
            return { success: false, message: errorMessage };
        }
    };

    const updateCategory = async (id, categoryData) => {
        try {
            const response = await axios.put(
                `/api/categories/${id}`,
                categoryData
            );
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_categories`);
                await fetchCategories(true);
                return { success: true, data: response.data.data };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat memperbarui kategori";
            return { success: false, message: errorMessage };
        }
    };

    const deleteCategory = async (id) => {
        try {
            const response = await axios.delete(`/api/categories/${id}`);
            if (response.data.success) {
                // Invalidate cache dan force refresh
                localStorage.removeItem(`${CACHE_KEY}_categories`);
                await fetchCategories(true);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menghapus kategori";
            return { success: false, message: errorMessage };
        }
    };

    const refreshData = () => {
        fetchCategories(true);
    };

    useEffect(() => {
        // Cek apakah ada cached data terlebih dahulu
        const cachedCategories = getCachedData(`${CACHE_KEY}_categories`);

        // Jika tidak ada cached data, fetch dengan loading
        // Jika ada cached data, fetch di background tanpa loading
        if (!cachedCategories) {
            fetchCategories(true);
        } else {
            fetchCategories(false); // Background refresh
        }
    }, []);

    return {
        categories,
        error,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshData,
    };
};
