import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Helper function untuk mengecek bahan baku utama yang habis dari komposisi
// PENTING: Hanya cek bahan baku utama (is_bahan_baku_utama = true)
const getOutOfStockMainIngredient = (variant) => {
    if (!variant) {
        return null;
    }
    
    // Pastikan compositions adalah array
    let compositions = variant.compositions;
    if (!compositions) {
        return null;
    }
    
    // Jika compositions adalah object/collection, convert ke array
    if (!Array.isArray(compositions)) {
        if (typeof compositions === 'object' && compositions.length !== undefined) {
            compositions = Array.from(compositions);
        } else if (typeof compositions === 'object') {
            // Coba convert object ke array
            try {
                compositions = Object.values(compositions);
            } catch (e) {
                return null;
            }
        } else {
            return null;
        }
    }
    
    if (compositions.length === 0) {
        return null;
    }
    
    // Cari bahan baku utama
    let mainIngredient = null;
    for (const composition of compositions) {
        if (composition && typeof composition === 'object') {
            const isMain = composition.is_bahan_baku_utama;
            // Cek dengan berbagai format: true, 1, '1', 'true'
            if (isMain === true || isMain === 1 || isMain === '1' || isMain === 'true' || (typeof isMain === 'number' && isMain === 1) || (typeof isMain === 'string' && isMain === '1')) {
                mainIngredient = composition;
                console.log('Found main ingredient:', composition.nama_bahan, 'stok:', composition.stok_bahan, 'is_main:', isMain);
                break;
            }
        }
    }
    
    // Jika tidak ada bahan baku utama yang dipilih, gunakan bahan pertama (backward compatibility)
    if (!mainIngredient && compositions.length > 0) {
        mainIngredient = compositions[0];
    }
    
    if (!mainIngredient) {
        return null;
    }
    
    // Cek apakah stok bahan baku utama habis atau tidak cukup untuk membuat 1 porsi
    const stokBahan = parseFloat(mainIngredient.stok_bahan) || 0;
    const jumlahPerPorsi = parseFloat(mainIngredient.jumlah_per_porsi) || 0;
    const namaBahan = mainIngredient.nama_bahan || 'Bahan tidak diketahui';
    
    // Bahan baku utama dianggap habis jika:
    // 1. Stok <= 0 (PALING PENTING - jika stok 0, pasti habis)
    // 2. Stok < jumlah yang dibutuhkan per porsi
    if (stokBahan <= 0) {
        return {
            nama: namaBahan,
            stok: stokBahan,
            dibutuhkan: jumlahPerPorsi,
            reason: 'Stok habis (0 atau kurang)'
        };
    } else if (jumlahPerPorsi > 0 && stokBahan < jumlahPerPorsi) {
        return {
            nama: namaBahan,
            stok: stokBahan,
            dibutuhkan: jumlahPerPorsi,
            reason: 'Stok tidak cukup untuk 1 porsi'
        };
    }
    
    return null; // Bahan baku utama tersedia
};

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
    const addToCart = (variant, quantity, product = null) => {
        // Pastikan quantity selalu integer
        quantity = Math.floor(quantity);
        
        // Validasi stok berdasarkan jenis variant:
        // 1. Variant dengan komposisi: bisa dijual jika stok_varian > 0 (produk jadi) ATAU stok_prediksi > 0 (bisa dibuat dari bahan)
        // 2. Variant tanpa komposisi: cek stok_varian
        const isDirectProduct = variant.is_direct_product === true || variant.id_varian?.toString().startsWith('product_');
        const predictedStock = variant.stok_prediksi;
        const variantStock = variant.stok_varian ?? 0;
        const hasComposition = variant.compositions && variant.compositions.length > 0;
        
        // PENTING: Cek flag dari backend terlebih dahulu
        if (variant.has_out_of_stock_ingredient === true) {
            // Cek juga bahan baku utama yang habis untuk memberikan informasi lebih detail
            const outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
            if (outOfStockMainIngredient) {
                alert(`⚠ Bahan baku utama habis!\n\nProduk "${variant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
            } else {
                alert(`⚠ Bahan baku utama habis!\n\nProduk "${variant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena bahan baku utamanya habis.\n\nSilakan restock bahan baku utama terlebih dahulu.`);
            }
            return;
        }
        
        // PENTING: Cek bahan baku utama yang habis dari frontend juga (double check)
        // Jika bahan baku utama habis, produk TIDAK BISA ditambahkan ke cart
        const outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
        if (outOfStockMainIngredient) {
            alert(`⚠ Bahan baku utama habis!\n\nProduk "${variant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
            return;
        }
        
        // Untuk produk langsung (stok_prediksi = 999), selalu bisa ditambahkan
        if (isDirectProduct || predictedStock === 999) {
            // Produk langsung selalu bisa ditambahkan
            } else if (hasComposition) {
                // Variant dengan komposisi: total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)
                const totalAvailable = variantStock + (predictedStock || 0);
                
                if (totalAvailable <= 0) {
                    alert(`⚠ Stok bahan tidak mencukupi untuk membuat ${variant.nama_varian || 'produk ini'}.`);
                    return;
                }
                
                if (quantity > totalAvailable) {
                    // Untuk angkringan, fokus pada stok yang bisa dibuat dari bahan
                    if (predictedStock > 0) {
                        alert(`⚠ Stok hanya cukup untuk ${Math.floor(totalAvailable)} porsi. Tidak bisa menambahkan ${quantity} porsi.`);
                    } else {
                        alert(`⚠ Stok ${variant.nama_varian || 'produk ini'} tidak mencukupi.`);
                    }
                    return;
                }
        } else {
            // Variant tanpa komposisi: cek stok_varian
            if (variantStock <= 0) {
                alert(`Stok ${variant.nama_varian || 'produk ini'} tidak mencukupi.`);
                return;
            }
            
            if (quantity > variantStock) {
                alert(`Stok hanya cukup untuk ${variantStock} porsi. Tidak bisa menambahkan ${quantity} porsi.`);
                return;
            }
        }

        const existingItem = cart.find(
            (item) => item.variant.id_varian === variant.id_varian
        );

        // Find product parent if not provided
        let productParent = product;
        if (!productParent) {
            productParent = products.find(
                (p) =>
                    p.variants &&
                    p.variants.some((v) => v.id_varian === variant.id_varian)
            );
        }

        if (existingItem) {
            // Cek total quantity setelah ditambahkan
            const newQuantity = existingItem.quantity + quantity;
            
            // Validasi stok untuk existing item berdasarkan jenis variant
            if (!isDirectProduct && predictedStock !== 999) {
                let maxStock = 0;
                if (hasComposition) {
                    // Variant dengan komposisi: total = stok_varian + stok_prediksi
                    maxStock = variantStock + (predictedStock || 0);
                } else {
                    maxStock = variantStock;
                }
                
                // Cek apakah stok habis
                if (maxStock <= 0) {
                    alert(`⚠ Stok ${variant.nama_varian || 'produk ini'} sudah habis. Tidak bisa menambahkan lagi.`);
                    return;
                }
                
                if (newQuantity > maxStock) {
                    const maxCanAdd = Math.floor(maxStock - existingItem.quantity);
                    if (maxCanAdd <= 0) {
                        alert(`⚠ Stok tidak mencukupi. Maksimal yang bisa ditambahkan: ${Math.floor(existingItem.quantity)} porsi.`);
                        return;
                    }
                    alert(`⚠ Stok hanya cukup untuk ${Math.floor(maxStock)} porsi. Hanya bisa menambahkan ${maxCanAdd} porsi lagi.`);
                    quantity = maxCanAdd;
                }
            }
            
            // Pastikan quantity selalu integer
            const finalQuantity = Math.floor(existingItem.quantity + quantity);
            
            setCart(
                cart.map((item) =>
                    item.variant.id_varian === variant.id_varian
                        ? {
                              ...item,
                              quantity: finalQuantity,
                              subtotal: item.price * finalQuantity,
                              product: productParent || item.product,
                          }
                        : item
                )
            );
        } else {
            // Pastikan quantity selalu integer
            const finalQuantity = Math.floor(quantity);
            setCart([
                ...cart,
                {
                    variant,
                    product: productParent,
                    quantity: finalQuantity,
                    price: variant.harga,
                    subtotal: variant.harga * finalQuantity,
                },
            ]);
        }
    };

    // Update item quantity
    const updateQuantity = (variantId, quantity) => {
        // Pastikan quantity adalah integer
        quantity = Math.floor(quantity);
        
        if (quantity <= 0) {
            removeFromCart(variantId);
            return;
        }

        // Cari item di cart
        const item = cart.find((item) => item.variant.id_varian === variantId);
        if (!item) {
            return;
        }

        // Validasi stok berdasarkan jenis variant
        const variant = item.variant;
        const isDirectProduct = variant.is_direct_product || variant.id_varian?.toString().startsWith('product_');
        const predictedStock = variant.stok_prediksi;
        const variantStock = variant.stok_varian ?? 0;
        const hasComposition = variant.compositions && variant.compositions.length > 0;
        
        // Untuk variant dengan komposisi atau tanpa komposisi, cek stok yang sesuai
        if (!isDirectProduct && predictedStock !== 999) {
            let maxStock = 0;
            if (hasComposition) {
                // Variant dengan komposisi: total = stok_varian + stok_prediksi
                maxStock = variantStock + (predictedStock || 0);
            } else {
                maxStock = variantStock;
            }
            
            // Pastikan maxStock juga integer untuk perbandingan
            const maxStockInt = Math.floor(maxStock);
            
            if (maxStock !== undefined && maxStock !== null && quantity > maxStockInt) {
                alert(`⚠ Stok hanya cukup untuk ${maxStockInt} porsi.`);
                // Set quantity ke maksimal yang tersedia (integer)
                quantity = maxStockInt;
            }
        }

        // Pastikan quantity final adalah integer
        const finalQuantity = Math.floor(quantity);

        setCart(
            cart.map((item) =>
                item.variant.id_varian === variantId
                    ? { ...item, quantity: finalQuantity, subtotal: item.price * finalQuantity }
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
            const items = cart.map((item) => {
                // Ensure variant_id is sent correctly - can be integer or string (product_*)
                let variantId = item.variant.id_varian;

                // If it's a string that doesn't start with 'product_', keep it as is (might be converted)
                // If it's numeric string, convert to number, otherwise keep as string
                if (
                    typeof variantId === "string" &&
                    !variantId.startsWith("product_")
                ) {
                    // If it's a numeric string, convert to number for normal variants
                    const numericId = parseInt(variantId, 10);
                    if (
                        !isNaN(numericId) &&
                        numericId.toString() === variantId
                    ) {
                        variantId = numericId;
                    }
                }

                return {
                    variant_id: variantId,
                    quantity: parseFloat(item.quantity) || 1,
                };
            });

            console.log("Sending transaction data:", {
                items,
                payment_method: paymentData.method,
                cash_amount: paymentData.cashAmount,
                transfer_proof: paymentData.transferProof,
            });

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
                
                // Refresh produk secara langsung untuk update stok prediksi realtime
                // Lakukan refresh dengan await untuk memastikan data ter-update sebelum return
                try {
                    const refreshResponse = await axios.get("/api/transactions/products");
                    if (refreshResponse.data.success) {
                        setProducts(refreshResponse.data.data);
                        setCachedData(`${CACHE_KEY}_products`, refreshResponse.data.data);
                        console.log("Products refreshed after transaction");
                    }
                } catch (err) {
                    console.error("Error refreshing products after transaction:", err);
                    // Jika error refresh, tetap lanjutkan karena transaksi sudah berhasil
                    // Tapi coba refresh sekali lagi secara background
                    setTimeout(() => {
                        axios.get("/api/transactions/products")
                            .then((retryResponse) => {
                                if (retryResponse.data.success) {
                                    setProducts(retryResponse.data.data);
                                    setCachedData(`${CACHE_KEY}_products`, retryResponse.data.data);
                                }
                            })
                            .catch(() => {
                                // Silent fail on retry
                            });
                    }, 500);
                }
                
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
                    if (filters.paymentMethod)
                        params.append("payment_method", filters.paymentMethod);
                    if (filters.search) params.append("search", filters.search);

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
                if (filters.paymentMethod)
                    params.append("payment_method", filters.paymentMethod);
                if (filters.search) params.append("search", filters.search);

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
