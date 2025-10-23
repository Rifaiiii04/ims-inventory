import React, { useState, useEffect } from "react";

function VariantFormModal({ variant, products, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: "",
        product_id: "",
        stok: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (variant) {
            setFormData({
                name: variant.name || "",
                product_id: variant.product_id || "",
                stok: variant.stok || ""
            });
        }
    }, [variant]);

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

        if (!formData.name.trim()) {
            newErrors.name = "Nama varian harus diisi";
        }

        if (!formData.product_id) {
            newErrors.product_id = "Produk harus dipilih";
        }


        if (!formData.stok || formData.stok < 0) {
            newErrors.stok = "Stok tidak boleh negatif";
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
                stok: parseFloat(formData.stok)
            };

            if (variant) {
                submitData.id = variant.id;
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
                                {variant ? "Edit Varian" : "Tambah Varian"}
                            </h2>
                            <p className="text-green-50 text-sm">
                                {variant ? "Perbarui data varian" : "Tambahkan varian produk baru"}
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
                        {/* Nama Varian */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Varian *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan nama varian"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

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
                                    errors.product_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Pilih Produk</option>
                                {products.map((product) => (
                                    <option key={product.id_produk} value={product.id_produk}>
                                        {product.nama_produk}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
                            )}
                        </div>


                        {/* Stok */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stok *
                            </label>
                            <input
                                type="number"
                                name="stok"
                                value={formData.stok}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    errors.stok ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan stok"
                            />
                            {errors.stok && (
                                <p className="mt-1 text-sm text-red-600">{errors.stok}</p>
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
                                    {variant ? "Memperbarui..." : "Menambahkan..."}
                                </>
                            ) : (
                                variant ? "Perbarui Varian" : "Tambah Varian"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VariantFormModal;