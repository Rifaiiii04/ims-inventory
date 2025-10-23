import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const useProduct = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/products");
            if (response.data.success) {
                setProducts(response.data.data);
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
    }, [isAuthenticated]);

    const fetchCategories = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get("/api/products/categories/list");
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                console.error(
                    "Error fetching categories:",
                    response.data.message
                );
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, [isAuthenticated]);

    const fetchIngredients = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get("/api/products/ingredients/list");
            if (response.data.success) {
                setIngredients(response.data.data);
            } else {
                console.error(
                    "Error fetching ingredients:",
                    response.data.message
                );
            }
        } catch (err) {
            console.error("Error fetching ingredients:", err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchIngredients();

        // Set up auto-refresh for product data
        const intervalId = setInterval(() => {
            fetchProducts();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchProducts, fetchCategories, fetchIngredients]);

    const createProduct = async (productData) => {
        try {
            const response = await axios.post("/api/products", productData);
            if (response.data.success) {
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
        fetchProducts();
        fetchCategories();
        fetchIngredients();
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
