import React, { useState, useEffect } from "react";

function ProductFormModal({
    product,
    categories,
    ingredients,
    onClose,
    onSubmit,
}) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        ingredients: [],
        initialStock: "",
        sellPrice: "",
        variants: [{ name: "", price: "" }],
    });

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                ingredients: product.ingredients || [],
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientToggle = (ingredient) => {
        setFormData((prev) => ({
            ...prev,
            ingredients: prev.ingredients.includes(ingredient)
                ? prev.ingredients.filter((i) => i !== ingredient)
                : [...prev.ingredients, ingredient],
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData((prev) => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { name: "", price: "" }],
        }));
    };

    const removeVariant = (index) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {product ? "Edit Produk" : "Tambah Produk Baru"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg"
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

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Nama Produk */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Produk *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Nasi Goreng"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                                required
                            />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bahan Baku */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Bahan Baku
                            </label>
                            <div className="border-2 border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                {ingredients.map((ing) => (
                                    <label
                                        key={ing.id}
                                        className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.ingredients.includes(
                                                ing.name
                                            )}
                                            onChange={() =>
                                                handleIngredientToggle(ing.name)
                                            }
                                            className="w-4 h-4 text-green-600"
                                        />
                                        <span className="text-sm">
                                            {ing.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Stok Awal */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Stok Awal *
                                </label>
                                <input
                                    type="number"
                                    name="initialStock"
                                    value={formData.initialStock}
                                    onChange={handleChange}
                                    placeholder="50"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                                    required
                                    min="0"
                                />
                            </div>

                            {/* Harga Jual */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Harga Jual (Rp) *
                                </label>
                                <input
                                    type="number"
                                    name="sellPrice"
                                    value={formData.sellPrice}
                                    onChange={handleChange}
                                    placeholder="15000"
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Varian */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Varian Produk
                                </label>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold hover:bg-green-200"
                                >
                                    + Tambah Varian
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.variants.map((variant, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                                    >
                                        <input
                                            type="text"
                                            value={variant.name}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nama varian"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    "price",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Harga"
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            required
                                            min="0"
                                        />
                                        {formData.variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeVariant(index)
                                                }
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="size-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 font-semibold shadow-lg text-sm"
                        >
                            {product ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductFormModal;
