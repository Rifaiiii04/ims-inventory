import React from "react";
import DivisionSettingsForm from "./DivisionSettingsForm";

function ManualInputForm({ formData, onChange, categories = [] }) {
    return (
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
                    placeholder="Contoh: 10"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                    required
                    min="0"
                />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Form Opsional - Pembagian Bahan */}
            <DivisionSettingsForm formData={formData} onChange={onChange} />
        </div>
    );
}

export default ManualInputForm;
