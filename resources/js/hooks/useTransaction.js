import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Cache configuration
const CACHE_KEY = "transaction_data_cache";
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

export const useTransaction = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
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
        if (cachedProducts) {
            setProducts(cachedProducts);
            hasInitialData.current = true;
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch products with variants
    const fetchProducts = useCallback(
        async (forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Jika ada cached data dan tidak force refresh, skip loading
            if (!forceRefresh && hasInitialData.current) {
                // Background refresh
                try {
                    const response = await axios.get(
                        "/api/transactions/products"
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
                    // Jika error, tetap gunakan cached data
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get("/api/transactions/products");
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

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const cachedProducts = getCachedData(`${CACHE_KEY}_products`);
        if (!cachedProducts) {
            fetchProducts(true);
        } else {
            fetchProducts(false); // Background refresh
        }
    }, [fetchProducts, isAuthenticated]);

    // Add item to cart
    const addToCart = (variant, quantity) => {
        const existingItem = cart.find(
            (item) => item.variant.id_varian === variant.id_varian
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.variant.id_varian === variant.id_varian
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    variant,
                    quantity,
                    price: variant.harga,
                    subtotal: variant.harga * quantity,
                },
            ]);
        }
    };

    // Update item quantity
    const updateQuantity = (variantId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(variantId);
            return;
        }

        setCart(
            cart.map((item) =>
                item.variant.id_varian === variantId
                    ? { ...item, quantity, subtotal: item.price * quantity }
                    : item
            )
        );
    };

    // Remove item from cart
    const removeFromCart = (variantId) => {
        setCart(cart.filter((item) => item.variant.id_varian !== variantId));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // Calculate total
    const getTotal = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    // Process transaction
    const processTransaction = async (paymentData) => {
        try {
            const items = cart.map((item) => ({
                variant_id: item.variant.id_varian,
                quantity: item.quantity,
            }));

            const response = await axios.post("/api/transactions", {
                items,
                payment_method: paymentData.method,
                cash_amount: paymentData.cashAmount,
                transfer_proof: paymentData.transferProof,
            });

            if (response.data.success) {
                // Invalidate cache setelah transaksi berhasil
                localStorage.removeItem(`${CACHE_KEY}_products`);
                clearCart();
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("Error processing transaction:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message ||
                    "Terjadi kesalahan saat memproses transaksi",
            };
        }
    };

    return {
        products,
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        processTransaction,
        refreshProducts: () => fetchProducts(true),
    };
};

// Hook for transaction history
export const useTransactionHistory = () => {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    // Load cached data immediately - tidak untuk history karena biasanya difilter
    const fetchHistory = useCallback(
        async (filters = {}, forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Untuk history, kita tidak cache karena biasanya difilter
            // Tapi kita tetap bisa skip loading jika bukan first load
            if (
                !forceRefresh &&
                hasInitialData.current &&
                transactions.length > 0
            ) {
                // Background refresh
                try {
                    const params = new URLSearchParams();
                    if (filters.startDate)
                        params.append("start_date", filters.startDate);
                    if (filters.endDate)
                        params.append("end_date", filters.endDate);
                    if (filters.cashierId)
                        params.append("cashier_id", filters.cashierId);

                    const response = await axios.get(
                        `/api/transactions/history?${params}`
                    );
                    if (response.data.success) {
                        setTransactions(response.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching transaction history:", err);
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (filters.startDate)
                    params.append("start_date", filters.startDate);
                if (filters.endDate) params.append("end_date", filters.endDate);
                if (filters.cashierId)
                    params.append("cashier_id", filters.cashierId);

                const response = await axios.get(
                    `/api/transactions/history?${params}`
                );
                if (response.data.success) {
                    setTransactions(response.data.data);
                    hasInitialData.current = true;
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                console.error("Error fetching transaction history:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil riwayat transaksi"
                );
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, transactions.length]
    );

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        fetchHistory({}, true); // Initial load
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        transactions,
        loading,
        error,
        fetchHistory,
    };
};

// Hook for sales report
export const useSalesReport = () => {
    const { isAuthenticated } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasInitialData = useRef(false);

    const fetchReport = useCallback(
        async (startDate, endDate, forceRefresh = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            // Untuk report, skip loading jika ada data dan tidak force refresh
            if (!forceRefresh && hasInitialData.current && report !== null) {
                // Background refresh
                try {
                    const params = new URLSearchParams();
                    if (startDate) params.append("start_date", startDate);
                    if (endDate) params.append("end_date", endDate);

                    const response = await axios.get(
                        `/api/transactions/sales/report?${params}`
                    );
                    if (response.data.success) {
                        setReport(response.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching sales report:", err);
                }
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (startDate) params.append("start_date", startDate);
                if (endDate) params.append("end_date", endDate);

                const response = await axios.get(
                    `/api/transactions/sales/report?${params}`
                );
                if (response.data.success) {
                    setReport(response.data.data);
                    hasInitialData.current = true;
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                console.error("Error fetching sales report:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil laporan penjualan"
                );
            } finally {
                setLoading(false);
            }
        },
        [isAuthenticated, report]
    );

    return {
        report,
        loading,
        error,
        fetchReport,
    };
};
