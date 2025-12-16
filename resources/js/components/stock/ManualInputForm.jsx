import React, { useState, useEffect } from "react";
import DivisionSettingsForm from "./DivisionSettingsForm";

function ManualInputForm({
    formData,
    onChange,
    categories = [],
    isEditMode = false,
}) {
    const [formattedPrice, setFormattedPrice] = useState("");
    const [isPriceFocused, setIsPriceFocused] = useState(false);
    const [quantityError, setQuantityError] = useState("");

    // Format harga untuk display saat form dibuka dengan data yang sudah ada
    useEffect(() => {
        if (formData.buyPrice) {
            const numValue = parseFloat(formData.buyPrice) || 0;
            if (numValue > 0) {
                setFormattedPrice(
                    `Rp ${new Intl.NumberFormat("id-ID").format(numValue)}`
                );
            } else {
                setFormattedPrice("");
            }
        } else {
            setFormattedPrice("");
        }
    }, [formData.buyPrice]);

    // Validasi quantity vs minStock (hanya untuk mode tambah)
    useEffect(() => {
        if (!isEditMode && formData.quantity && formData.minStock) {
            const quantity = parseFloat(formData.quantity) || 0;
            const minStock = parseFloat(formData.minStock) || 0;

            if (quantity < minStock) {
                setQuantityError(
                    `Jumlah tidak boleh kurang dari Minimum Stock (${minStock})`
                );
            } else {
                setQuantityError("");
            }
        } else {
            setQuantityError("");
        }
    }, [formData.quantity, formData.minStock, isEditMode]);

    // Handle change untuk harga dengan format Rupiah
    const handlePriceChange = (e) => {
        const inputValue = e.target.value;

        // Hapus semua karakter non-digit (termasuk Rp, titik, koma, spasi)
        let numericValue = inputValue.replace(/[^\d]/g, "");

        // Konversi ke number
        const numValue = numericValue === "" ? "" : parseFloat(numericValue);

        // Update formData dengan nilai numerik
        onChange({
            target: {
                name: "buyPrice",
                value: numValue === "" ? "" : numValue.toString(),
            },
        });

        // Update formatted price untuk real-time display dengan format Rupiah
        if (numericValue === "") {
            setFormattedPrice("");
        } else {
            // Format langsung dengan Rupiah saat typing
            setFormattedPrice(
                `Rp ${new Intl.NumberFormat("id-ID").format(
                    parseInt(numericValue)
                )}`
            );
        }
    };

    // Handle focus - tetap tampilkan format Rupiah
    const handlePriceFocus = (e) => {
        setIsPriceFocused(true);
        const numValue = parseFloat(formData.buyPrice) || 0;
        if (numValue > 0) {
            // Tetap format dengan Rupiah saat focus
            setFormattedPrice(
                `Rp ${new Intl.NumberFormat("id-ID").format(numValue)}`
            );
        } else {
            setFormattedPrice("");
        }
    };

    // Handle blur - format kembali dengan Rupiah
    const handlePriceBlur = (e) => {
        setIsPriceFocused(false);
        const numValue = parseFloat(formData.buyPrice) || 0;
        if (numValue > 0) {
            setFormattedPrice(
                `Rp ${new Intl.NumberFormat("id-ID").format(numValue)}`
            );
        } else {
            setFormattedPrice("");
        }
    };
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
                    Harga Beli *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="buyPrice"
                        value={formattedPrice || ""}
                        onChange={handlePriceChange}
                        onFocus={handlePriceFocus}
                        onBlur={handlePriceBlur}
                        placeholder="Rp 0"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-sm"
                        required
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Harga per satuan</p>
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
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                        quantityError
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 focus:border-green-500"
                    }`}
                    required
                    min={
                        !isEditMode && formData.minStock
                            ? formData.minStock
                            : "0"
                    }
                />
                {quantityError && (
                    <p className="mt-1 text-sm text-red-600">{quantityError}</p>
                )}

                {/* Total Cost Display */}
                {formData.buyPrice && formData.quantity && (
                    <div className="mt-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1 font-semibold">
                            Total Cost
                        </div>
                        <div className="font-bold text-green-700 text-lg">
                            Rp{" "}
                            {(
                                parseFloat(formData.buyPrice) *
                                parseFloat(formData.quantity)
                            ).toLocaleString("id-ID")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {formData.quantity} × Rp{" "}
                            {parseFloat(formData.buyPrice).toLocaleString(
                                "id-ID"
                            )}
                        </div>
                    </div>
                )}
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
