import React, { useState, useEffect } from "react";

function StockFormModal({ stock, onClose, onSubmit, categories = [] }) {
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        buyPrice: "",
        quantity: "",
        unit: "",
        minStock: "",
        is_divisible: false,
        max_divisions: "",
        division_description: "",
    });

    useEffect(() => {
        if (stock) {
            setFormData(stock);
        }
    }, [stock]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {stock ? "Edit Stok" : "Tambah Stok Baru"}
                        </h2>
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
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Nama Stok */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nama Stok *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Nasi Putih"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                            />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id_kategori}
                                        value={category.id_kategori}
                                    >
                                        {category.nama_kategori}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Harga Beli */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Beli (Rp) *
                            </label>
                            <input
                                type="number"
                                name="buyPrice"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                placeholder="Contoh: 5000"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                                min="0"
                            />
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
                                placeholder="Contoh: 50"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                                min="0"
                            />
                        </div>

                        {/* Satuan */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Satuan *
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="Contoh: Porsi, Kg, Pack"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                            />
                        </div>

                        {/* Minimum Stock */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Minimum Stock *
                            </label>
                            <input
                                type="number"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                                placeholder="Contoh: 10"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                required
                                min="0"
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6"></div>

                        {/* Form Opsional - Pembagian Bahan */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                ⚙️ Pengaturan Pembagian (Opsional)
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Centang jika bahan ini bisa dibagi menjadi
                                beberapa bagian (contoh: Ayam Utuh → Dada, Paha,
                                Sayap)
                            </p>

                            {/* Checkbox Pembagian */}
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    name="is_divisible"
                                    checked={formData.is_divisible}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Bahan ini dapat dibagi menjadi beberapa
                                    bagian
                                </label>
                            </div>

                            {/* Form Pembagian (muncul jika checkbox dicentang) */}
                            {formData.is_divisible && (
                                <div className="space-y-4">
                                    {/* Maksimal Pembagian */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Maksimal Pembagian
                                        </label>
                                        <input
                                            type="number"
                                            name="max_divisions"
                                            value={formData.max_divisions}
                                            onChange={handleChange}
                                            placeholder="Contoh: 6 (untuk ayam: dada, paha, sayap, kepala, leher, ceker)"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                                            min="1"
                                        />
                                    </div>

                                    {/* Deskripsi Pembagian */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Deskripsi Pembagian
                                        </label>
                                        <textarea
                                            name="division_description"
                                            value={
                                                formData.division_description
                                            }
                                            onChange={handleChange}
                                            placeholder="Contoh: Dapat dibagi menjadi: Dada, Paha, Sayap, Kepala, Leher, Ceker"
                                            rows="3"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 font-semibold shadow-lg transition-all text-sm"
                        >
                            {stock ? "Update" : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StockFormModal;
