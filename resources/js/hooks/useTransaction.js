import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useTransaction = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products with variants
    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/transactions/products');
            if (response.data.success) {
                setProducts(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data produk');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Add item to cart
    const addToCart = (variant, quantity) => {
        const existingItem = cart.find(item => item.variant.id_varian === variant.id_varian);
        
        if (existingItem) {
            setCart(cart.map(item => 
                item.variant.id_varian === variant.id_varian 
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCart([...cart, {
                variant,
                quantity,
                price: variant.harga,
                subtotal: variant.harga * quantity
            }]);
        }
    };

    // Update item quantity
    const updateQuantity = (variantId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(variantId);
            return;
        }
        
        setCart(cart.map(item => 
            item.variant.id_varian === variantId 
                ? { ...item, quantity, subtotal: item.price * quantity }
                : item
        ));
    };

    // Remove item from cart
    const removeFromCart = (variantId) => {
        setCart(cart.filter(item => item.variant.id_varian !== variantId));
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
            const items = cart.map(item => ({
                variant_id: item.variant.id_varian,
                quantity: item.quantity
            }));

            const response = await axios.post('/api/transactions', {
                items,
                payment_method: paymentData.method,
                cash_amount: paymentData.cashAmount,
                transfer_proof: paymentData.transferProof
            });

            if (response.data.success) {
                clearCart();
                return { success: true, data: response.data.data };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error('Error processing transaction:', err);
            return { 
                success: false, 
                message: err.response?.data?.message || 'Terjadi kesalahan saat memproses transaksi' 
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
        refreshProducts: fetchProducts
    };
};

// Hook for transaction history
export const useTransactionHistory = () => {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async (filters = {}) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.cashierId) params.append('cashier_id', filters.cashierId);

            const response = await axios.get(`/api/transactions/history?${params}`);
            if (response.data.success) {
                setTransactions(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching transaction history:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil riwayat transaksi');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        transactions,
        loading,
        error,
        fetchHistory
    };
};

// Hook for sales report
export const useSalesReport = () => {
    const { isAuthenticated } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReport = useCallback(async (startDate, endDate) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const response = await axios.get(`/api/transactions/sales/report?${params}`);
            if (response.data.success) {
                setReport(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching sales report:', err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil laporan penjualan');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    return {
        report,
        loading,
        error,
        fetchReport
    };
};
