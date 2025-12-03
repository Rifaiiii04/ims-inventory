import React, { useState } from "react";

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

function ProductSelector({ products, onAddToCart }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [addedItems, setAddedItems] = useState(new Set());

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductClick = (product) => {
        // Validasi variants
        if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
            console.error('Product has no valid variants:', product);
            return;
        }
        
        // Jika produk tidak punya variant atau hanya punya 1 variant (produk langsung)
        if (!product.has_variants || product.variants.length === 1) {
            const variant = product.variants[0];
            if (!variant) {
                console.error('Variant is null:', product);
                return;
            }
            
            // PENTING: Cek flag dari backend terlebih dahulu
            if (variant.has_out_of_stock_ingredient === true) {
                alert(`⚠ Bahan pokok habis!\n\nProduk "${variant.nama_varian || product.name}" tidak bisa ditambahkan karena ada bahan yang habis.\n\nSilakan restock bahan terlebih dahulu.`);
                return;
            }
            
            // Validasi stok bahan sebelum menambahkan ke keranjang - sama dengan logika di addToCart
            const isDirectProduct = variant.is_direct_product === true || variant.id_varian?.toString().startsWith('product_');
            const predictedStock = variant.stok_prediksi;
            const variantStock = variant.stok_varian ?? 0;
            const hasComposition = variant.compositions && Array.isArray(variant.compositions) && variant.compositions.length > 0;
            
            // Untuk produk langsung (stok_prediksi = 999), selalu bisa ditambahkan
            if (isDirectProduct || predictedStock === 999) {
                // Produk langsung selalu bisa ditambahkan
            } else if (hasComposition) {
                // Variant dengan komposisi: total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)
                const totalAvailable = variantStock + (predictedStock || 0);
                
                // Cek bahan yang habis - PENTING: cek ini SEBELUM cek totalAvailable
                const outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
                
                if (outOfStockMainIngredient) {
                    alert(`⚠ Bahan baku utama habis!\n\nProduk "${variant.nama_varian || product.name}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
                    return;
                }
                
                if (totalAvailable <= 0) {
                    alert(`⚠ Stok bahan tidak mencukupi untuk membuat ${variant.nama_varian || product.name}.`);
                    return;
                }
            } else {
                // Variant tanpa komposisi: cek stok_varian
                if (variantStock <= 0) {
                    alert(`⚠ Stok ${variant.nama_varian || product.name} tidak mencukupi.`);
                    return;
                }
            }
            
            // Langsung tambah ke keranjang dengan quantity 1, termasuk produk parent
            onAddToCart(variant, 1, product);

            // Feedback visual
            const itemKey = `${product.id}_${variant.id_varian}`;
            setAddedItems((prev) => new Set([...prev, itemKey]));
            setTimeout(() => {
                setAddedItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(itemKey);
                    return newSet;
                });
            }, 1000);
        } else {
            // Jika punya multiple variants, pilih produk dulu
            setSelectedProduct(product);
            setSelectedVariant(null);
            setQuantity(1);
        }
    };

    const handleVariantSelect = (variant) => {
        // PENTING: Cek flag dari backend terlebih dahulu
        if (variant.has_out_of_stock_ingredient === true) {
            alert(`⚠ Bahan pokok habis!\n\nProduk "${variant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena ada bahan yang habis.\n\nSilakan restock bahan terlebih dahulu.`);
            return;
        }
        
        // Validasi stok bahan sebelum menambahkan ke keranjang - sama dengan logika di addToCart
        const isDirectProduct = variant.is_direct_product === true || variant.id_varian?.toString().startsWith('product_');
        const predictedStock = variant.stok_prediksi;
        const variantStock = variant.stok_varian ?? 0;
        const hasComposition = variant.compositions && Array.isArray(variant.compositions) && variant.compositions.length > 0;
        
        // Untuk produk langsung (stok_prediksi = 999), selalu bisa ditambahkan
        if (isDirectProduct || predictedStock === 999) {
            // Produk langsung selalu bisa ditambahkan
        } else if (hasComposition) {
            // Variant dengan komposisi: total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)
            const totalAvailable = variantStock + (predictedStock || 0);
            
            // Cek bahan yang habis - PENTING: cek ini SEBELUM cek totalAvailable
            const outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
            
            if (outOfStockMainIngredient) {
                alert(`⚠ Bahan baku utama habis!\n\nProduk "${variant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
                return;
            }
            
            if (totalAvailable <= 0) {
                alert(`⚠ Stok bahan tidak mencukupi untuk membuat ${variant.nama_varian || 'produk ini'}.`);
                return;
            }
        } else {
            // Variant tanpa komposisi: cek stok_varian
            if (variantStock <= 0) {
                alert(`⚠ Stok ${variant.nama_varian || 'produk ini'} tidak mencukupi.`);
                return;
            }
        }
        
        // Langsung tambah ke keranjang dengan quantity 1, termasuk produk parent
        onAddToCart(variant, 1, selectedProduct);

        // Feedback visual
        const itemKey = `${selectedProduct.id}_${variant.id_varian}`;
        setAddedItems((prev) => new Set([...prev, itemKey]));
        setTimeout(() => {
            setAddedItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(itemKey);
                return newSet;
            });
        }, 1000);

        // Reset selection
        setSelectedProduct(null);
        setSelectedVariant(null);
    };

    const handleAddToCart = () => {
        if (selectedVariant && quantity > 0) {
            // PENTING: Cek flag dari backend terlebih dahulu
            if (selectedVariant.has_out_of_stock_ingredient === true) {
                alert(`⚠ Bahan pokok habis!\n\nProduk "${selectedVariant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena ada bahan yang habis.\n\nSilakan restock bahan terlebih dahulu.`);
                return;
            }
            
            // Validasi stok bahan sebelum menambahkan ke keranjang - sama dengan logika di addToCart
            const isDirectProduct = selectedVariant.is_direct_product === true || selectedVariant.id_varian?.toString().startsWith('product_');
            const predictedStock = selectedVariant.stok_prediksi;
            const variantStock = selectedVariant.stok_varian ?? 0;
            const hasComposition = selectedVariant.compositions && Array.isArray(selectedVariant.compositions) && selectedVariant.compositions.length > 0;
            
            // Untuk produk langsung (stok_prediksi = 999), selalu bisa ditambahkan
            if (isDirectProduct || predictedStock === 999) {
                // Produk langsung selalu bisa ditambahkan
            } else if (hasComposition) {
                // Variant dengan komposisi: total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)
                const totalAvailable = variantStock + (predictedStock || 0);
                
                // Cek bahan yang habis - PENTING: cek ini SEBELUM cek totalAvailable
                const outOfStockMainIngredient = getOutOfStockMainIngredient(selectedVariant);
                
                if (outOfStockMainIngredient) {
                    alert(`⚠ Bahan baku utama habis!\n\nProduk "${selectedVariant.nama_varian || 'produk ini'}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
                    return;
                }
                
                if (totalAvailable <= 0) {
                    alert(`⚠ Stok bahan tidak mencukupi untuk membuat ${selectedVariant.nama_varian || 'produk ini'}.`);
                    return;
                }
            } else {
                // Variant tanpa komposisi: cek stok_varian
                if (variantStock <= 0) {
                    alert(`⚠ Stok ${selectedVariant.nama_varian || 'produk ini'} tidak mencukupi.`);
                    return;
                }
            }
            
            onAddToCart(selectedVariant, quantity, selectedProduct);
            setQuantity(1);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Pilih Produk
                </h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <svg
                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Product List */}
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => {
                            // Pastikan variants adalah array dan tidak kosong
                            if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
                                return null; // Skip produk tanpa variant
                            }
                            
                            const variant = product.variants[0];
                            const itemKey = `${product.id}_${variant?.id_varian}`;
                            const isAdded = addedItems.has(itemKey);
                            
                            // Cek apakah stok habis - lebih ketat
                            const isDirectProduct = variant?.is_direct_product === true || variant?.id_varian?.toString().startsWith('product_');
                            const predictedStock = variant?.stok_prediksi;
                            const variantStock = variant?.stok_varian ?? 0;
                            const hasComposition = variant?.compositions && Array.isArray(variant.compositions) && variant.compositions.length > 0;
                            
                            // PENTING: Cek bahan yang habis untuk SEMUA produk yang punya komposisi
                            // Jangan peduli apakah dianggap "produk langsung" atau tidak
                            // Cek ini TERLEBIH DAHULU sebelum cek status lainnya
                            
                            // Cek apakah variant punya compositions (cek lebih ketat dan robust)
                            let hasCompositionStrict = false;
                            let compositionsArray = [];
                            
                            if (variant?.compositions) {
                                if (Array.isArray(variant.compositions)) {
                                    compositionsArray = variant.compositions;
                                    hasCompositionStrict = compositionsArray.length > 0;
                                } else if (typeof variant.compositions === 'object') {
                                    // Jika object, coba convert ke array
                                    try {
                                        compositionsArray = Object.values(variant.compositions);
                                        hasCompositionStrict = compositionsArray.length > 0;
                                    } catch (e) {
                                        hasCompositionStrict = false;
                                    }
                                }
                            }
                            
                            // Cek bahan baku utama yang habis - PENTING: Hanya cek bahan baku utama
                            // Cek untuk SEMUA produk yang punya komposisi, tidak peduli apakah is_direct_product atau tidak
                            // PENTING: Cek ini HARUS dilakukan untuk SEMUA produk yang punya komposisi
                            let outOfStockMainIngredient = null;
                            let hasOutOfStockMainIngredient = false;
                            
                            // Cek komposisi dengan lebih ketat - PENTING: Cek ini untuk SEMUA produk
                            if (variant?.compositions) {
                                let comps = variant.compositions;
                                if (Array.isArray(comps) && comps.length > 0) {
                                    outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
                                    hasOutOfStockMainIngredient = outOfStockMainIngredient !== null;
                                } else if (typeof comps === 'object' && comps !== null) {
                                    // Coba convert object ke array
                                    try {
                                        const compsArray = Object.values(comps);
                                        if (compsArray.length > 0) {
                                            // Buat variant sementara dengan compositions array
                                            const tempVariant = { ...variant, compositions: compsArray };
                                            outOfStockMainIngredient = getOutOfStockMainIngredient(tempVariant);
                                            hasOutOfStockMainIngredient = outOfStockMainIngredient !== null;
                                        }
                                    } catch (e) {
                                        // Ignore error
                                    }
                                }
                            }
                            
                            // PENTING: Cek juga dari hasCompositionStrict dan hasComposition
                            if (!hasOutOfStockMainIngredient && (hasCompositionStrict || hasComposition)) {
                                outOfStockMainIngredient = getOutOfStockMainIngredient(variant);
                                hasOutOfStockMainIngredient = outOfStockMainIngredient !== null;
                            }
                            
                            // Gunakan flag dari backend jika ada, atau cek dari frontend
                            const hasOutOfStockFromBackend = variant?.has_out_of_stock_ingredient === true;
                            
                            // Jika bahan baku utama habis (dari backend ATAU dari frontend), produk TIDAK TERSEDIA
                            // Karena tidak bisa diproduksi tanpa bahan baku utama
                            // PENTING: Cek ini untuk SEMUA produk yang punya komposisi, meskipun is_direct_product = true
                            const isProductUnavailable = hasOutOfStockFromBackend || hasOutOfStockMainIngredient;
                            
                            // Untuk variant dengan komposisi, total stok = stok_varian + stok_prediksi
                            // Untuk variant tanpa komposisi, hanya cek stok_varian
                            let totalAvailableStock = predictedStock;
                            if (!isDirectProduct && hasComposition && predictedStock !== 999) {
                                totalAvailableStock = variantStock + (predictedStock || 0);
                            } else if (!isDirectProduct && !hasComposition) {
                                totalAvailableStock = variantStock;
                            }
                            
                            // Produk dianggap habis jika:
                            // 1. Ada bahan baku utama yang habis (isProductUnavailable) - PRIORITAS UTAMA
                            // 2. Stok habis (totalAvailableStock <= 0)
                            // PENTING: Jika ada bahan baku utama habis, produk TIDAK BOLEH dijual meskipun ada stok_varian
                            // PENTING: Untuk produk dengan komposisi, jika bahan baku utama habis, langsung dianggap tidak tersedia
                            const isOutOfStock = isProductUnavailable || (!isDirectProduct && (totalAvailableStock === undefined || totalAvailableStock === null || totalAvailableStock <= 0));

                            return (
                                <div
                                    key={product.id}
                                    onClick={(e) => {
                                        if (isOutOfStock || isProductUnavailable) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            // Tampilkan alert dengan daftar bahan yang habis
                                            if (hasOutOfStockMainIngredient) {
                                                alert(`⚠ Bahan baku utama habis!\n\nProduk "${product.name}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
                                            } else {
                                                alert(`⚠ Stok bahan habis! Tidak bisa menambahkan ${product.name} ke keranjang.`);
                                            }
                                            return;
                                        }
                                        handleProductClick(product);
                                    }}
                                    className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                                        isOutOfStock || isProductUnavailable
                                            ? "border-red-400 bg-red-50 opacity-75 cursor-not-allowed"
                                            : selectedProduct?.id === product.id
                                            ? "border-green-500 bg-green-50 shadow-lg cursor-pointer"
                                            : isAdded
                                            ? "border-green-600 bg-green-100 shadow-lg scale-105 cursor-pointer"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                            {product.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 text-sm">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {product.category}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex-1">
                                                <p className="text-xs text-gray-600">
                                                        {product.has_variants && product.variants && Array.isArray(product.variants)
                                                        ? `${product.variants.length} varian tersedia`
                                                        : "Produk langsung"}
                                                </p>
                                                    {isOutOfStock || isProductUnavailable ? (
                                                        <div className="mt-0.5">
                                                            <p className="text-xs text-red-600 font-bold">
                                                                ⚠ TIDAK TERSEDIA
                                                            </p>
                                                            {hasOutOfStockMainIngredient && (
                                                                <p className="text-xs text-red-500 mt-0.5">
                                                                    Bahan baku utama habis: {outOfStockMainIngredient.nama}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : variant?.stok_prediksi !== undefined ? (
                                                        // PENTING: HANYA tampilkan "Tersedia" jika TIDAK ada bahan baku utama habis
                                                        // Cek isProductUnavailable TERLEBIH DAHULU sebelum menampilkan status
                                                        // PENTING: Jika produk punya komposisi dan bahan baku utama habis, TIDAK BOLEH menampilkan "Tersedia"
                                                        isProductUnavailable ? (
                                                            <p className="text-xs text-red-600 font-medium mt-0.5">
                                                                ⚠ Tidak tersedia
                                                            </p>
                                                        ) : (() => {
                                                            // PENTING: Hanya tampilkan "Tersedia" jika:
                                                            // 1. Produk TIDAK punya komposisi (produk langsung)
                                                            // 2. DAN stok_prediksi = 999
                                                            // 3. DAN TIDAK ada bahan baku utama habis
                                                            // Jika produk punya komposisi, TIDAK BOLEH menampilkan "Tersedia" meskipun stok_prediksi = 999
                                                            
                                                            // Cek apakah produk benar-benar produk langsung (tanpa komposisi)
                                                            const hasAnyComposition = hasCompositionStrict || hasComposition || (variant?.compositions && (
                                                                (Array.isArray(variant.compositions) && variant.compositions.length > 0) ||
                                                                (typeof variant.compositions === 'object' && Object.keys(variant.compositions).length > 0)
                                                            ));
                                                            
                                                            const isTrueDirectProduct = !hasAnyComposition && variant.stok_prediksi === 999;
                                                            
                                                            if (isTrueDirectProduct) {
                                                                return (
                                                                    <p className="text-xs text-green-600 font-medium mt-0.5">
                                                                        ✓ Tersedia
                                                                    </p>
                                                                );
                                                            } else if (hasAnyComposition) {
                                                                // Produk dengan komposisi: tampilkan jumlah porsi yang bisa dibuat
                                                                return (
                                                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                                        📊 Bisa dibuat: ~{Math.floor(totalAvailableStock)} porsi
                                                                    </p>
                                                                );
                                                            } else {
                                                                // Produk tanpa komposisi tapi bukan produk langsung
                                                                return (
                                                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                                        📊 Stok: ~{Math.floor(predictedStock)} porsi
                                                                    </p>
                                                                );
                                                            }
                                                        })()
                                                    ) : null}
                                                </div>
                                                <p className="text-sm font-bold text-green-600">
                                                    {formatPrice(product.harga)}
                                                </p>
                                            </div>
                                            {isAdded && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                                    ✓ Ditambahkan
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Variant Selection */}
                {selectedProduct && selectedProduct.has_variants && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-800 mb-3">
                            Pilih Varian - {selectedProduct.name}
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedProduct.variants && Array.isArray(selectedProduct.variants) && selectedProduct.variants.length > 0 ? (
                                selectedProduct.variants.map((variant) => {
                                    const isDirectProduct = variant.is_direct_product === true || variant.id_varian?.toString().startsWith('product_');
                                    const predictedStock = variant.stok_prediksi;
                                    const variantStock = variant.stok_varian ?? 0;
                                    const hasComposition = variant.compositions && Array.isArray(variant.compositions) && variant.compositions.length > 0;
                                    
                                    // PENTING: Cek bahan baku utama yang habis untuk variant dengan komposisi
                                    const outOfStockMainIngredient = hasComposition ? getOutOfStockMainIngredient(variant) : null;
                                    const hasOutOfStockMainIngredient = outOfStockMainIngredient !== null;
                                    const hasOutOfStockFromBackend = variant?.has_out_of_stock_ingredient === true;
                                    const isVariantUnavailable = hasOutOfStockFromBackend || hasOutOfStockMainIngredient;
                                    
                                    // Untuk variant dengan komposisi, total stok = stok_varian + stok_prediksi
                                    // Untuk variant tanpa komposisi, hanya cek stok_varian
                                    let totalAvailableStock = predictedStock;
                                    if (!isDirectProduct && hasComposition && predictedStock !== 999) {
                                        totalAvailableStock = variantStock + (predictedStock || 0);
                                    } else if (!isDirectProduct && !hasComposition) {
                                        totalAvailableStock = variantStock;
                                    }
                                    
                                    // Variant dianggap habis jika stok habis ATAU ada bahan habis
                                    const isOutOfStock = (!isDirectProduct && (totalAvailableStock === undefined || totalAvailableStock === null || totalAvailableStock <= 0)) || isVariantUnavailable;
                                    
                                    return (
                                <div
                                    key={variant.id_varian}
                                    onClick={(e) => {
                                        if (isOutOfStock || isVariantUnavailable) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            
                                            if (hasOutOfStockMainIngredient) {
                                                alert(`⚠ Bahan baku utama habis!\n\nVarian "${variant.nama_varian}" tidak bisa ditambahkan karena bahan baku utama "${outOfStockMainIngredient.nama}" habis (stok: ${outOfStockMainIngredient.stok}).\n\nSilakan restock bahan baku utama terlebih dahulu.`);
                                            } else {
                                                alert(`⚠ Stok bahan habis! Tidak bisa menambahkan ${variant.nama_varian} ke keranjang.`);
                                            }
                                            return;
                                        }
                                        handleVariantSelect(variant);
                                    }}
                                    className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                                        isOutOfStock || isVariantUnavailable
                                            ? "border-red-400 bg-red-50 opacity-75 cursor-not-allowed"
                                            : selectedVariant?.id_varian ===
                                        variant.id_varian
                                                ? "border-green-500 bg-green-50 cursor-pointer"
                                                : "border-gray-200 hover:border-gray-300 cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="font-medium text-gray-800">
                                                {variant.nama_varian}
                                            </h5>
                                            <p className="text-sm text-gray-500">
                                                Stok: {variant.stok_varian}
                                            </p>
                                            {isOutOfStock || isVariantUnavailable ? (
                                                <div>
                                                    <p className="text-xs text-red-600 font-bold">
                                                        ⚠ STOK HABIS
                                                    </p>
                                                    {hasOutOfStockMainIngredient && (
                                                        <p className="text-xs text-red-500 mt-0.5">
                                                            Bahan baku utama habis: {outOfStockMainIngredient.nama}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : variant.stok_prediksi !== undefined && !isVariantUnavailable ? (
                                                variant.stok_prediksi === 999 ? (
                                                    <p className="text-xs text-green-600 font-medium">
                                                        ✓ Tersedia (produk langsung)
                                                    </p>
                                                ) : hasComposition ? (
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        📊 Bisa dibuat: ~{Math.floor(totalAvailableStock)} porsi
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        📊 Stok: ~{Math.floor(predictedStock)} porsi
                                                    </p>
                                                )
                                            ) : null}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                {formatPrice(variant.harga)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm">Tidak ada varian tersedia untuk produk ini.</p>
                                    <p className="text-xs mt-1">Stok bahan mungkin tidak mencukupi.</p>
                                </div>
                            )}
                        </div>

                        {/* Quantity and Add to Cart */}
                        {selectedVariant && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jumlah
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            quantity - 1
                                                        )
                                                    )
                                                }
                                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20 12H4"
                                                    />
                                                </svg>
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={
                                                    selectedVariant.stok_varian
                                                }
                                                value={quantity}
                                                onChange={(e) =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            Math.min(
                                                                selectedVariant.stok_varian,
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 1
                                                            )
                                                        )
                                                    )
                                                }
                                                className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1"
                                            />
                                            <button
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.min(
                                                            selectedVariant.stok_varian,
                                                            quantity + 1
                                                        )
                                                    )
                                                }
                                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total
                                        </label>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatPrice(
                                                selectedVariant.harga * quantity
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductSelector;
