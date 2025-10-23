import React, { useState, useEffect } from "react";

function CompositionFormModal({ composition, variants, ingredients, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        variant_id: "",
        ingredient_id: "",
        quantity: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (composition) {
            setFormData({
                variant_id: composition.variant_id || "",
                ingredient_id: composition.ingredient_id || "",
                quantity: composition.quantity || ""
            });
        }
    }, [composition]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.variant_id) {
            newErrors.variant_id = "Varian harus dipilih";
        }

        if (!formData.ingredient_id) {
            newErrors.ingredient_id = "Bahan harus dipilih";
        }

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = "Jumlah harus lebih dari 0";
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
            const submitData = {
                ...formData,
                quantity: parseFloat(formData.quantity)
            };

            if (composition) {
                submitData.id = composition.id;
            }

            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
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
                                {composition ? "Edit Komposisi" : "Tambah Komposisi"}
                            </h2>
                            <p className="text-green-50 text-sm">
                                {composition ? "Perbarui data komposisi" : "Tambahkan komposisi baru"}
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Varian */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Varian *
                            </label>
                            <select
                                name="variant_id"
                                value={formData.variant_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.variant_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Pilih Varian</option>
                                {variants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.name} - {variant.product_name}
                                    </option>
                                ))}
                            </select>
                            {errors.variant_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.variant_id}</p>
                            )}
                        </div>

                        {/* Bahan */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Bahan *
                            </label>
                            <select
                                name="ingredient_id"
                                value={formData.ingredient_id}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.ingredient_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Pilih Bahan</option>
                                {ingredients.map((ingredient) => (
                                    <option key={ingredient.id_bahan} value={ingredient.id_bahan}>
                                        {ingredient.nama_bahan} ({ingredient.satuan})
                                    </option>
                                ))}
                            </select>
                            {errors.ingredient_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.ingredient_id}</p>
                            )}
                        </div>

                        {/* Jumlah */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jumlah *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan jumlah bahan"
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                            )}
                        </div>
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
                                    {composition ? "Memperbarui..." : "Menambahkan..."}
                                </>
                            ) : (
                                composition ? "Perbarui Komposisi" : "Tambah Komposisi"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompositionFormModal;
