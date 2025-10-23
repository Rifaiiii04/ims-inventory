import React from "react";

function DivisionSettingsForm({ formData, onChange }) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ⚙️ Pengaturan Pembagian (Opsional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Centang jika bahan ini bisa dibagi menjadi beberapa bagian
                (contoh: Ayam Utuh → Dada, Paha, Sayap)
            </p>

            {/* Checkbox Pembagian */}
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    name="is_divisible"
                    checked={formData.is_divisible}
                    onChange={onChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                    Bahan ini dapat dibagi menjadi beberapa bagian
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
                            onChange={onChange}
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
                            value={formData.division_description}
                            onChange={onChange}
                            placeholder="Contoh: Dapat dibagi menjadi: Dada, Paha, Sayap, Kepala, Leher, Ceker"
                            rows="3"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm resize-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DivisionSettingsForm;
