import React, { useState } from "react";

function OcrReviewModal({
    isOpen,
    onClose,
    ocrItems,
    onConfirmAdd,
    categories = [],
}) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemDetails, setItemDetails] = useState({});

    // Initialize item details when modal opens
    React.useEffect(() => {
        if (isOpen && ocrItems.length > 0) {
            const initialDetails = {};
            ocrItems.forEach((item, index) => {
                initialDetails[index] = {
                    category_id: "",
                    unit: "pcs",
                    minStock: 10,
                    ...item,
                };
            });
            setItemDetails(initialDetails);
            setSelectedItems(ocrItems.map((_, index) => index));
        }
    }, [isOpen, ocrItems]);

    const handleItemToggle = (index) => {
        setSelectedItems((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const handleItemDetailChange = (index, field, value) => {
        setItemDetails((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [field]: value,
            },
        }));
    };

    const handleConfirm = () => {
        // Validasi: pastikan semua item yang dipilih punya category_id
        const itemsToAdd = selectedItems.map((index) => {
            const item = itemDetails[index];
            // Jika category_id kosong, gunakan category pertama
            if (!item.category_id && categories.length > 0) {
                item.category_id = categories[0].id_kategori;
            }
            return item;
        });
        
        // Filter item yang tidak valid (nama_barang kosong)
        const validItems = itemsToAdd.filter(item => item.nama_barang && item.nama_barang.trim() !== '');
        
        if (validItems.length === 0) {
            alert('Tidak ada item yang valid untuk ditambahkan. Pastikan nama barang tidak kosong.');
            return;
        }
        
        onConfirmAdd(validItems);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Review Hasil OCR</h2>
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
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600 mb-2">
                            Silakan review dan lengkapi data item yang
                            terdeteksi dari foto:
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Total item: {ocrItems.length}</span>
                            <span>Dipilih: {selectedItems.length}</span>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-3 py-2 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedItems.length ===
                                                    ocrItems.length &&
                                                ocrItems.length > 0
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems(
                                                        ocrItems.map(
                                                            (_, index) => index
                                                        )
                                                    );
                                                } else {
                                                    setSelectedItems([]);
                                                }
                                            }}
                                            className="w-4 h-4 text-green-600"
                                        />
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Nama Barang
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Kategori
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Harga (Rp)
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Jumlah
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Satuan
                                    </th>
                                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                        Min Stock
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ocrItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-gray-50 ${
                                            selectedItems.includes(index)
                                                ? "bg-green-50"
                                                : ""
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(
                                                    index
                                                )}
                                                onChange={() =>
                                                    handleItemToggle(index)
                                                }
                                                className="w-4 h-4 text-green-600"
                                            />
                                        </td>

                                        {/* Nama Barang */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="text"
                                                value={
                                                    itemDetails[index]
                                                        ?.nama_barang || ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "nama_barang",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                placeholder="Nama barang"
                                            />
                                        </td>

                                        {/* Kategori */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <select
                                                value={
                                                    itemDetails[index]
                                                        ?.category_id || ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "category_id",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                            >
                                                <option value="">Pilih</option>
                                                {categories.map((category) => (
                                                    <option
                                                        key={
                                                            category.id_kategori
                                                        }
                                                        value={
                                                            category.id_kategori
                                                        }
                                                    >
                                                        {category.nama_kategori}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Harga */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="number"
                                                value={
                                                    itemDetails[index]?.harga ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "harga",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </td>

                                        {/* Jumlah */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="number"
                                                value={
                                                    itemDetails[index]
                                                        ?.jumlah || ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "jumlah",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </td>

                                        {/* Satuan */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="text"
                                                value={
                                                    itemDetails[index]?.unit ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "unit",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                placeholder="pcs"
                                            />
                                        </td>

                                        {/* Min Stock */}
                                        <td className="border border-gray-300 px-3 py-2">
                                            <input
                                                type="number"
                                                value={
                                                    itemDetails[index]
                                                        ?.minStock || ""
                                                }
                                                onChange={(e) =>
                                                    handleItemDetailChange(
                                                        index,
                                                        "minStock",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                placeholder="10"
                                                min="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    {selectedItems.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>{selectedItems.length}</strong> item
                                dipilih untuk ditambahkan ke stok
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={selectedItems.length === 0}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 font-semibold shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {selectedItems.length > 0
                            ? `Tambah ${selectedItems.length} Item ke Stok`
                            : "Pilih Item Terlebih Dahulu"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OcrReviewModal;
