import React, { useState } from "react";

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
        // Jika produk tidak punya variant atau hanya punya 1 variant (produk langsung)
        if (!product.has_variants || product.variants.length === 1) {
            const variant = product.variants[0];
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

    const handleQuickAdd = (variant, qty = 1, product = null) => {
        // Find product from products array
        const productParent = product || filteredProducts.find(p => 
            p.variants.some(v => v.id_varian === variant.id_varian)
        );
        onAddToCart(variant, qty, productParent);
    };

    const handleAddToCart = () => {
        if (selectedVariant && quantity > 0) {
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
                            const variant = product.variants[0];
                            const itemKey = `${product.id}_${variant?.id_varian}`;
                            const isAdded = addedItems.has(itemKey);

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product)}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                        selectedProduct?.id === product.id
                                            ? "border-green-500 bg-green-50 shadow-lg"
                                            : isAdded
                                            ? "border-green-600 bg-green-100 shadow-lg scale-105"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
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
                                                <p className="text-xs text-gray-600">
                                                    {product.has_variants
                                                        ? `${product.variants.length} varian tersedia`
                                                        : "Produk langsung"}
                                                </p>
                                                <p className="text-sm font-bold text-green-600">
                                                    {formatPrice(product.harga)}
                                                </p>
                                            </div>
                                            {/* Quick add buttons for direct products */}
                                            {!product.has_variants && (
                                                <div className="flex gap-1 mt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuickAdd(
                                                                product
                                                                    .variants[0],
                                                                1,
                                                                product
                                                            );
                                                        }}
                                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                                    >
                                                        +1
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuickAdd(
                                                                product
                                                                    .variants[0],
                                                                2,
                                                                product
                                                            );
                                                        }}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        +2
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuickAdd(
                                                                product
                                                                    .variants[0],
                                                                5,
                                                                product
                                                            );
                                                        }}
                                                        className="px-2 py-1 bg-green-700 text-white text-xs rounded hover:bg-green-800 transition-colors"
                                                    >
                                                        +5
                                                    </button>
                                                </div>
                                            )}
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
                            {selectedProduct.variants.map((variant) => (
                                <div
                                    key={variant.id_varian}
                                    onClick={() => handleVariantSelect(variant)}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        selectedVariant?.id_varian ===
                                        variant.id_varian
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 hover:border-gray-300"
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
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                {formatPrice(variant.harga)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
