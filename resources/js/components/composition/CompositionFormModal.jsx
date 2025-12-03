import React, { useState, useEffect } from "react";

function CompositionFormModal({
    composition,
    variants,
    products,
    ingredients,
    onClose,
    onSubmit,
}) {
    const [formData, setFormData] = useState({
        product_id: "",
        variant_id: "",
        ingredients: [], // Array untuk multiple bahan
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State untuk form tambah bahan
    const [newIngredient, setNewIngredient] = useState({
        ingredient_id: "",
        quantity: "",
    });

    useEffect(() => {
        if (composition) {
            // Pastikan ingredients memiliki is_bahan_baku_utama
            const ingredientsWithMainFlag = (composition.ingredients || []).map(ing => ({
                ...ing,
                is_bahan_baku_utama: ing.is_bahan_baku_utama === true || ing.is_bahan_baku_utama === 1 || false
            }));
            
            setFormData({
                product_id: composition.product_id || "",
                variant_id: composition.variant_id || "",
                ingredients: ingredientsWithMainFlag,
            });
            // Set selected product for variant filtering
            if (composition.product_id) {
                const product = products.find(p => Number(p.id) === Number(composition.product_id));
                setSelectedProduct(product || null);
            }
        } else {
            setSelectedProduct(null);
        }
    }, [composition, products]);

    // Filter variants berdasarkan produk yang dipilih
    const filteredVariants = selectedProduct 
        ? variants.filter(variant => Number(variant.product_id) === Number(selectedProduct.id))
        : variants;

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'product_id') {
            const product = products.find(p => Number(p.id) === Number(value));
            setSelectedProduct(product || null);
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                variant_id: "", // Reset variant when product changes
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleNewIngredientChange = (e) => {
        const { name, value } = e.target;
        setNewIngredient((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addIngredient = () => {
        if (
            !newIngredient.ingredient_id ||
            !newIngredient.quantity ||
            newIngredient.quantity <= 0
        ) {
            alert("Pilih bahan dan isi jumlah yang valid");
            return;
        }

        // Cek apakah bahan sudah ada
        const exists = formData.ingredients.some(
            (ing) => ing.ingredient_id === newIngredient.ingredient_id
        );
        if (exists) {
            alert("Bahan ini sudah ditambahkan");
            return;
        }

        const ingredient = ingredients.find(
            (ing) => ing.id_bahan == newIngredient.ingredient_id
        );
        
        // Jika ini bahan pertama, otomatis jadi bahan baku utama
        const isFirstIngredient = formData.ingredients.length === 0;
        
        setFormData((prev) => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    ingredient_id: newIngredient.ingredient_id,
                    quantity: parseFloat(newIngredient.quantity),
                    ingredient_name: ingredient?.nama_bahan || "",
                    unit: ingredient?.satuan || "",
                    is_bahan_baku_utama: isFirstIngredient, // Bahan pertama otomatis jadi utama
                },
            ],
        }));

        setNewIngredient({ ingredient_id: "", quantity: "" });
    };
    
    // Handler untuk mengubah bahan baku utama (hanya 1 yang bisa dipilih)
    const handleSetMainIngredient = (index) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) => ({
                ...ing,
                is_bahan_baku_utama: i === index, // Hanya yang dipilih yang jadi true
            })),
        }));
    };

    const removeIngredient = (index) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.product_id) {
            newErrors.product_id = "Produk harus dipilih";
        }

        // Variant hanya wajib jika produk memiliki variants
        if (selectedProduct && filteredVariants.length > 0 && !formData.variant_id) {
            newErrors.variant_id = "Varian harus dipilih";
        }

        if (formData.ingredients.length === 0) {
            newErrors.ingredients = "Minimal satu bahan harus ditambahkan";
        }
        
        // Validasi: Harus ada minimal 1 bahan baku utama
        const hasMainIngredient = formData.ingredients.some(ing => ing.is_bahan_baku_utama === true);
        if (!hasMainIngredient && formData.ingredients.length > 0) {
            newErrors.ingredients = "Pilih minimal satu bahan sebagai Bahan Baku Utama";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Kirim setiap bahan sebagai komposisi terpisah
            for (const ingredient of formData.ingredients) {
                const submitData = {
                    product_id: formData.product_id,
                    variant_id: formData.variant_id || null, // Bisa null jika tidak ada variant
                    ingredient_id: ingredient.ingredient_id,
                    quantity: ingredient.quantity,
                    is_bahan_baku_utama: ingredient.is_bahan_baku_utama || false,
                };

                if (composition) {
                    submitData.id = composition.id;
                }

                await onSubmit(submitData);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                {composition
                                    ? "Edit Komposisi"
                                    : "Tambah Komposisi"}
                            </h2>
                            <p className="text-green-50 text-sm">
                                {composition
                                    ? "Perbarui data komposisi"
                                    : "Tambahkan komposisi baru"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6"
                >
                    <div className="space-y-4">
                        {/* Produk */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Produk *
                            </label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.product_id
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300"
                                }`}
                            >
                                <option value="">Pilih Produk</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.product_id}
                                </p>
                            )}
                        </div>

                        {/* Varian - Hanya tampil jika produk memiliki variants */}
                        {selectedProduct && filteredVariants.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Varian *
                                </label>
                                <select
                                    name="variant_id"
                                    value={formData.variant_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                        errors.variant_id
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <option value="">Pilih Varian</option>
                                    {filteredVariants.map((variant) => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.variant_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.variant_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Info jika produk tidak memiliki variant */}
                        {selectedProduct && filteredVariants.length === 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-blue-700">
                                        Produk ini tidak memiliki varian. Komposisi akan ditambahkan langsung ke produk.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tambah Bahan */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Tambah Bahan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <select
                                        name="ingredient_id"
                                        value={newIngredient.ingredient_id}
                                        onChange={handleNewIngredientChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Pilih Bahan</option>
                                        {ingredients.map((ingredient) => (
                                            <option
                                                key={ingredient.id_bahan}
                                                value={ingredient.id_bahan}
                                            >
                                                {ingredient.nama_bahan} (
                                                {ingredient.satuan})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newIngredient.quantity}
                                        onChange={handleNewIngredientChange}
                                        min="0.01"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="Jumlah"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <button
                                        type="button"
                                        onClick={addIngredient}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        + Tambah Bahan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Daftar Bahan yang Ditambahkan */}
                        {formData.ingredients.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Bahan yang Ditambahkan
                                </h4>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-yellow-800">
                                        <strong>💡 Tips:</strong> Pilih salah satu bahan sebagai <strong>Bahan Baku Utama</strong>. 
                                        Ketersediaan produk di transaksi akan bergantung pada stok bahan baku utama ini.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {formData.ingredients.map(
                                        (ingredient, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                                                    ingredient.is_bahan_baku_utama 
                                                        ? 'bg-green-50 border-green-400' 
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center flex-1">
                                                    <input
                                                        type="radio"
                                                        name="main_ingredient"
                                                        checked={ingredient.is_bahan_baku_utama || false}
                                                        onChange={() => handleSetMainIngredient(index)}
                                                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {ingredient.ingredient_name}
                                                            </span>
                                                            {ingredient.is_bahan_baku_utama && (
                                                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                                                                    Bahan Baku Utama
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-500 text-sm">
                                                            {ingredient.quantity} {ingredient.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeIngredient(index)
                                                    }
                                                    className="text-red-500 hover:text-red-700 p-1 ml-2"
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
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {errors.ingredients && (
                            <p className="text-sm text-red-600">
                                {errors.ingredients}
                            </p>
                        )}
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {composition
                                        ? "Memperbarui..."
                                        : "Menambahkan..."}
                                </>
                            ) : composition ? (
                                "Perbarui Komposisi"
                            ) : (
                                "Tambah Komposisi"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompositionFormModal;
