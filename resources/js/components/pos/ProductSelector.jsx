import React, { useState } from "react";

// Helper function untuk mengecek apakah bahan baku utama habis
const checkMainIngredientStock = (variant) => {
    if (!variant || !variant.compositions) {
        return { available: true, mainIngredient: null };
    }

    let compositions = variant.compositions;
    if (!Array.isArray(compositions)) {
        if (
            typeof compositions === "object" &&
            compositions.length !== undefined
        ) {
            compositions = Array.from(compositions);
        } else {
            return { available: true, mainIngredient: null };
        }
    }

    if (compositions.length === 0) {
        return { available: true, mainIngredient: null };
    }

    // Cari bahan baku utama
    let mainIngredient = null;
    for (const comp of compositions) {
        if (comp && comp.is_bahan_baku_utama) {
            const isMain = comp.is_bahan_baku_utama;
            if (
                isMain === true ||
                isMain === 1 ||
                isMain === "1" ||
                isMain === "true"
            ) {
                mainIngredient = comp;
                break;
            }
        }
    }

    // Jika tidak ada, gunakan bahan pertama
    if (!mainIngredient && compositions.length > 0) {
        mainIngredient = compositions[0];
    }

    if (!mainIngredient) {
        return { available: true, mainIngredient: null };
    }

    const stokBahan = parseFloat(mainIngredient.stok_bahan) || 0;
    const jumlahPerPorsi = parseFloat(mainIngredient.jumlah_per_porsi) || 0;

    // Jika stok <= 0 atau tidak cukup untuk 1 porsi, tidak tersedia
    if (stokBahan <= 0 || (jumlahPerPorsi > 0 && stokBahan < jumlahPerPorsi)) {
        return {
            available: false,
            mainIngredient: {
                nama: mainIngredient.nama_bahan || "Bahan tidak diketahui",
                stok: stokBahan,
            },
        };
    }

    return { available: true, mainIngredient: mainIngredient };
};

function ProductSelector({ products, onAddToCart }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Pastikan products selalu array
    const productsArray = Array.isArray(products) ? products : [];

    const filteredProducts = productsArray.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    const handleProductClick = (product) => {
        if (!product.variants || product.variants.length === 0) {
            return;
        }

        const variant = product.variants[0];

        // Cek apakah bahan baku utama habis
        const stockCheck = checkMainIngredientStock(variant);
        if (!stockCheck.available) {
            alert(
                `⚠ Produk tidak tersedia!\n\nBahan baku utama "${stockCheck.mainIngredient.nama}" habis (stok: ${stockCheck.mainIngredient.stok}).\n\nSilakan restock terlebih dahulu.`
            );
            return;
        }

        // Jika hanya 1 variant, langsung tambah ke cart
        if (product.variants.length === 1) {
            onAddToCart(variant, 1, product);
        } else {
            // Jika banyak variant, pilih dulu
            setSelectedProduct(product);
            setSelectedVariant(null);
            setQuantity(1);
        }
    };

    const handleVariantSelect = (variant) => {
        // Cek apakah produk tidak tersedia dari backend atau frontend
        const isOutOfStockFromBackend =
            variant.has_out_of_stock_ingredient === true ||
            variant.can_sell === false;
        const stockCheck = checkMainIngredientStock(variant);
        const isAvailable = !isOutOfStockFromBackend && stockCheck.available;

        if (!isAvailable) {
            if (stockCheck.mainIngredient) {
                alert(
                    `⚠ Variant tidak tersedia!\n\nBahan baku utama "${stockCheck.mainIngredient.nama}" habis (stok: ${stockCheck.mainIngredient.stok}).\n\nSilakan restock terlebih dahulu.`
                );
            } else {
                alert(`⚠ Variant tidak tersedia!\n\nStok variant habis.`);
            }
            return;
        }

        onAddToCart(variant, 1, selectedProduct);
        setSelectedProduct(null);
        setSelectedVariant(null);
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
                            if (
                                !product.variants ||
                                product.variants.length === 0
                            ) {
                                return null;
                            }

                            const variant = product.variants[0];

                            // LOGIKA KETERSEDIAAN PRODUK:
                            // SEMUA PRODUK HARUS PUNYA KOMPOSISI
                            // 1. Cek bahan baku utama dari komposisi
                            // 2. Total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)
                            // 3. Backend sudah menghitung stok_prediksi dengan benar, gunakan langsung dari backend

                            const variantStock =
                                parseFloat(variant.stok_varian) || 0;
                            const predictedStock =
                                parseFloat(variant.stok_prediksi) || 0;

                            // SEMUA produk harus cek bahan baku utama (semua punya komposisi)
                            const stockCheck =
                                checkMainIngredientStock(variant);

                            // Cek apakah produk tidak tersedia dari backend atau frontend
                            const isOutOfStockFromBackend =
                                variant.has_out_of_stock_ingredient === true ||
                                variant.can_sell === false;
                            const isAvailable =
                                !isOutOfStockFromBackend &&
                                stockCheck.available;

                            // Hitung total stok yang tersedia (selalu = stok_varian + stok_prediksi)
                            const totalAvailableStock =
                                variantStock + predictedStock;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        if (!isAvailable) {
                                            if (stockCheck.mainIngredient) {
                                                alert(
                                                    `⚠ Produk tidak tersedia!\n\nBahan baku utama "${stockCheck.mainIngredient.nama}" habis.`
                                                );
                                            } else {
                                                alert(
                                                    `⚠ Produk tidak tersedia!\n\nStok produk habis.`
                                                );
                                            }
                                            return;
                                        }
                                        handleProductClick(product);
                                    }}
                                    className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                                        !isAvailable
                                            ? "border-red-400 bg-red-50 opacity-75 cursor-not-allowed"
                                            : "border-gray-200 hover:border-green-500 hover:shadow-md cursor-pointer"
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
                                                        {product.has_variants &&
                                                        product.variants
                                                            .length > 1
                                                            ? `${product.variants.length} varian tersedia`
                                                            : "Produk langsung"}
                                                    </p>

                                                    {/* Status Produk */}
                                                    {!isAvailable ? (
                                                        <div className="mt-0.5">
                                                            <p className="text-xs text-red-600 font-bold">
                                                                ⚠ TIDAK TERSEDIA
                                                            </p>
                                                            {stockCheck.mainIngredient && (
                                                                <p className="text-xs text-red-500 mt-0.5">
                                                                    Bahan baku
                                                                    utama habis:{" "}
                                                                    {
                                                                        stockCheck
                                                                            .mainIngredient
                                                                            .nama
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-0.5">
                                                            {totalAvailableStock >
                                                            0 ? (
                                                                <p className="text-xs text-blue-600 font-medium">
                                                                    📊 Tersedia:{" "}
                                                                    {
                                                                        totalAvailableStock
                                                                    }{" "}
                                                                    porsi
                                                                    {variantStock >
                                                                        0 &&
                                                                        predictedStock >
                                                                            0 && (
                                                                            <span className="text-gray-500 ml-1">
                                                                                (
                                                                                {
                                                                                    variantStock
                                                                                }{" "}
                                                                                jadi
                                                                                +{" "}
                                                                                {
                                                                                    predictedStock
                                                                                }{" "}
                                                                                bisa
                                                                                dibuat)
                                                                            </span>
                                                                        )}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-red-600 font-bold">
                                                                    ⚠ TIDAK
                                                                    TERSEDIA
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-green-600">
                                                    {formatPrice(product.harga)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Variant Selection Modal */}
                {selectedProduct &&
                    selectedProduct.variants &&
                    selectedProduct.variants.length > 1 && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">
                                Pilih Varian - {selectedProduct.name}
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {selectedProduct.variants.map((variant) => {
                                    // LOGIKA KETERSEDIAAN PRODUK:
                                    // SEMUA PRODUK HARUS PUNYA KOMPOSISI
                                    // 1. Cek bahan baku utama dari komposisi
                                    // 2. Total stok = stok_varian (produk jadi) + stok_prediksi (bisa dibuat dari bahan)

                                    const variantStock =
                                        parseFloat(variant.stok_varian) || 0;
                                    const predictedStock =
                                        parseFloat(variant.stok_prediksi) || 0;

                                    // SEMUA produk harus cek bahan baku utama (semua punya komposisi)
                                    const stockCheck =
                                        checkMainIngredientStock(variant);

                                    // Cek apakah produk tidak tersedia dari backend atau frontend
                                    const isOutOfStockFromBackend =
                                        variant.has_out_of_stock_ingredient ===
                                            true || variant.can_sell === false;
                                    const isAvailable =
                                        !isOutOfStockFromBackend &&
                                        stockCheck.available;

                                    // Hitung total stok yang tersedia (selalu = stok_varian + stok_prediksi)
                                    const totalAvailableStock =
                                        variantStock + predictedStock;

                                    return (
                                        <div
                                            key={variant.id_varian}
                                            onClick={() => {
                                                if (!isAvailable) {
                                                    if (
                                                        stockCheck.mainIngredient
                                                    ) {
                                                        alert(
                                                            `⚠ Variant tidak tersedia!\n\nBahan baku utama "${stockCheck.mainIngredient.nama}" habis.`
                                                        );
                                                    } else {
                                                        alert(
                                                            `⚠ Variant tidak tersedia!\n\nStok variant habis.`
                                                        );
                                                    }
                                                    return;
                                                }
                                                handleVariantSelect(variant);
                                            }}
                                            className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                                                !isAvailable
                                                    ? "border-red-400 bg-red-50 opacity-75 cursor-not-allowed"
                                                    : "border-gray-200 hover:border-green-500 cursor-pointer"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h5 className="font-medium text-gray-800">
                                                        {variant.nama_varian}
                                                    </h5>
                                                    {!isAvailable ? (
                                                        <div>
                                                            <p className="text-xs text-red-600 font-bold">
                                                                ⚠ TIDAK TERSEDIA
                                                            </p>
                                                            {stockCheck.mainIngredient && (
                                                                <p className="text-xs text-red-500 mt-0.5">
                                                                    Bahan baku
                                                                    utama habis:{" "}
                                                                    {
                                                                        stockCheck
                                                                            .mainIngredient
                                                                            .nama
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {totalAvailableStock >
                                                            0 ? (
                                                                <p className="text-xs text-blue-600 font-medium">
                                                                    📊 Tersedia:{" "}
                                                                    {
                                                                        totalAvailableStock
                                                                    }{" "}
                                                                    porsi
                                                                    {variantStock >
                                                                        0 &&
                                                                        predictedStock >
                                                                            0 && (
                                                                            <span className="text-gray-500 ml-1">
                                                                                (
                                                                                {
                                                                                    variantStock
                                                                                }{" "}
                                                                                jadi
                                                                                +{" "}
                                                                                {
                                                                                    predictedStock
                                                                                }{" "}
                                                                                bisa
                                                                                dibuat)
                                                                            </span>
                                                                        )}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-red-600 font-bold">
                                                                    ⚠ TIDAK
                                                                    TERSEDIA
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        {formatPrice(
                                                            variant.harga
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}

export default ProductSelector;
