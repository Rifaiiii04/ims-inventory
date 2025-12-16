import React, { useState, useEffect } from "react";
import LoadingButton from "../common/LoadingButton";
import { useToast } from "../../hooks/useToast";

function OcrReviewModal({
    isOpen,
    onClose,
    ocrItems,
    onConfirmAdd,
    categories = [],
}) {
    const { showToast, ToastContainer } = useToast();

    const [selectedItems, setSelectedItems] = useState([]);
    const [itemDetails, setItemDetails] = useState({});
    const [formattedPrices, setFormattedPrices] = useState({});
    const [quantityErrors, setQuantityErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize item details when modal opens
    useEffect(() => {
        if (isOpen && ocrItems.length > 0) {
            const initialDetails = {};
            const initialFormattedPrices = {};
            ocrItems.forEach((item, index) => {
                initialDetails[index] = {
                    category_id: "",
                    unit: item.unit || "pcs",
                    minStock: item.minStock || 0,
                    ...item,
                };
                // Format harga jika ada
                if (item.harga) {
                    const harga = parseFloat(item.harga) || 0;
                    if (harga > 0) {
                        initialFormattedPrices[
                            index
                        ] = `Rp ${new Intl.NumberFormat("id-ID").format(
                            harga
                        )}`;
                    }
                }
            });
            setItemDetails(initialDetails);
            setFormattedPrices(initialFormattedPrices);
            setSelectedItems(ocrItems.map((_, index) => index));
        }
    }, [isOpen, ocrItems]);

    // Validasi quantity vs minStock untuk setiap item (hanya jika minStock > 0)
    useEffect(() => {
        const errors = {};
        Object.keys(itemDetails).forEach((index) => {
            const item = itemDetails[index];
            if (item.jumlah && item.minStock) {
                const quantity = parseFloat(item.jumlah) || 0;
                const minStock = parseFloat(item.minStock) || 0;
                // Hanya validasi jika minStock > 0
                if (minStock > 0 && quantity < minStock) {
                    errors[
                        index
                    ] = `Jumlah tidak boleh kurang dari Minimum Stock (${minStock})`;
                }
            }
        });
        setQuantityErrors(errors);
    }, [itemDetails]);

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

        // Handle format harga untuk field harga
        if (field === "harga") {
            const numValue = parseFloat(value) || 0;
            setFormattedPrices((prev) => ({
                ...prev,
                [index]:
                    numValue > 0
                        ? `Rp ${new Intl.NumberFormat("id-ID").format(
                              numValue
                          )}`
                        : "",
            }));
        }
    };

    const handlePriceChange = (index, e) => {
        const inputValue = e.target.value;
        // Hapus semua karakter non-digit
        let numericValue = inputValue.replace(/[^\d]/g, "");
        const numValue = numericValue === "" ? "" : parseFloat(numericValue);

        handleItemDetailChange(
            index,
            "harga",
            numValue === "" ? "" : numValue.toString()
        );
    };

    const handlePriceFocus = (index) => {
        const item = itemDetails[index];
        if (item?.harga) {
            const numValue = parseFloat(item.harga) || 0;
            if (numValue > 0) {
                setFormattedPrices((prev) => ({
                    ...prev,
                    [index]: `Rp ${new Intl.NumberFormat("id-ID").format(
                        numValue
                    )}`,
                }));
            }
        }
    };

    const handlePriceBlur = (index) => {
        const item = itemDetails[index];
        if (item?.harga) {
            const numValue = parseFloat(item.harga) || 0;
            if (numValue > 0) {
                setFormattedPrices((prev) => ({
                    ...prev,
                    [index]: `Rp ${new Intl.NumberFormat("id-ID").format(
                        numValue
                    )}`,
                }));
            }
        }
    };

    const handleConfirm = async () => {
        // Validasi: pastikan semua item yang dipilih punya category_id dan tidak ada error
        const hasErrors = selectedItems.some((index) => quantityErrors[index]);
        if (hasErrors) {
            showToast(
                "Terdapat error pada beberapa item. Silakan perbaiki terlebih dahulu.",
                "warning"
            );
            return;
        }

        const itemsToAdd = selectedItems.map((index) => {
            const item = { ...itemDetails[index] };
            // Jika category_id kosong, gunakan category pertama
            if (!item.category_id && categories.length > 0) {
                item.category_id = categories[0].id_kategori;
            }
            // Pastikan category_id adalah number yang valid
            if (item.category_id) {
                const parsedId = parseInt(item.category_id);
                if (!isNaN(parsedId) && parsedId > 0) {
                    item.category_id = parsedId;
                } else {
                    // If invalid, try to get from categories
                    if (categories.length > 0) {
                        item.category_id = parseInt(categories[0].id_kategori);
                    } else {
                        item.category_id = null;
                    }
                }
            }
            return item;
        });

        // Filter item yang tidak valid (nama_barang kosong)
        const validItems = itemsToAdd.filter(
            (item) => item.nama_barang && item.nama_barang.trim() !== ""
        );

        if (validItems.length === 0) {
            showToast(
                "Tidak ada item yang valid untuk ditambahkan. Pastikan nama barang tidak kosong.",
                "warning"
            );
            return;
        }

        // Validasi quantity vs minStock untuk setiap item
        const invalidItems = validItems.filter((item) => {
            const quantity = parseFloat(item.jumlah) || 0;
            const minStock = parseFloat(item.minStock) || 0;
            return minStock > 0 && quantity < minStock;
        });

        if (invalidItems.length > 0) {
            const itemNames = invalidItems
                .map((item) => item.nama_barang)
                .join(", ");
            alert(
                `Beberapa item memiliki jumlah yang kurang dari Minimum Stock:\n${itemNames}\n\nSilakan perbaiki terlebih dahulu.`
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await onConfirmAdd(validItems);
            onClose();
        } catch (error) {
            console.error("Error confirming OCR items:", error);
            showToast(
                "Terjadi kesalahan saat menambahkan item: " +
                    (error.message || error),
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                Review Hasil OCR
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

                        {/* Mobile Card View - Visible on mobile, hidden on desktop */}
                        <div className="md:hidden space-y-4">
                            {/* Select All Checkbox */}
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                                    className="w-5 h-5 text-green-600"
                                />
                                <label className="text-sm font-semibold text-gray-700">
                                    Pilih Semua ({selectedItems.length}/
                                    {ocrItems.length})
                                </label>
                            </div>

                            {/* Item Cards */}
                            {ocrItems.map((item, index) => (
                                <div
                                    key={index}
                                    className={`border-2 rounded-xl p-4 transition-all ${
                                        selectedItems.includes(index)
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 bg-white"
                                    }`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(
                                                    index
                                                )}
                                                onChange={() =>
                                                    handleItemToggle(index)
                                                }
                                                className="w-5 h-5 text-green-600 mt-1"
                                            />
                                            <div className="flex-1">
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                    Nama Barang
                                                </label>
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                    placeholder="Nama barang"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body - Grid Layout */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {/* Kategori */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                Kategori
                                            </label>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
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
                                        </div>

                                        {/* Satuan */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                Satuan
                                            </label>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                placeholder="pcs"
                                            />
                                        </div>
                                    </div>

                                    {/* Harga Beli */}
                                    <div className="mb-3">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                            Harga Beli (per satuan)
                                        </label>
                                        <input
                                            type="text"
                                            value={formattedPrices[index] || ""}
                                            onChange={(e) =>
                                                handlePriceChange(index, e)
                                            }
                                            onFocus={() =>
                                                handlePriceFocus(index)
                                            }
                                            onBlur={() =>
                                                handlePriceBlur(index)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                            placeholder="Rp 0"
                                        />
                                    </div>

                                    {/* Jumlah dan Min Stock - Side by Side */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {/* Jumlah */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                Jumlah
                                            </label>
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
                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                                                    quantityErrors[index]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                                        : "border-gray-300 focus:border-green-500 focus:ring-green-200"
                                                }`}
                                                placeholder="0"
                                                min={
                                                    itemDetails[index]?.minStock
                                                        ? itemDetails[index]
                                                              .minStock
                                                        : "0"
                                                }
                                            />
                                            {quantityErrors[index] && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    {quantityErrors[index]}
                                                </div>
                                            )}
                                        </div>

                                        {/* Min Stock */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                                Min Stock
                                            </label>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                                placeholder="10"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Total Cost */}
                                    {itemDetails[index]?.harga &&
                                    itemDetails[index]?.jumlah ? (
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                                            <div className="text-xs text-gray-600 mb-1 font-semibold">
                                                Total Cost
                                            </div>
                                            <div className="font-bold text-green-700 text-lg">
                                                Rp{" "}
                                                {(
                                                    parseFloat(
                                                        itemDetails[index]
                                                            ?.harga || 0
                                                    ) *
                                                    parseFloat(
                                                        itemDetails[index]
                                                            ?.jumlah || 0
                                                    )
                                                ).toLocaleString("id-ID")}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {itemDetails[index]?.jumlah} ×
                                                Rp{" "}
                                                {parseFloat(
                                                    itemDetails[index]?.harga ||
                                                        0
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-400">
                                                Masukkan harga dan jumlah untuk
                                                melihat total cost
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View - Hidden on mobile, visible on desktop */}
                        <div className="hidden md:block overflow-x-auto">
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
                                                                (_, index) =>
                                                                    index
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
                                            Harga Beli
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                            Jumlah
                                        </th>
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">
                                            Total Cost
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
                                                    <option value="">
                                                        Pilih
                                                    </option>
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.id_kategori
                                                                }
                                                                value={
                                                                    category.id_kategori
                                                                }
                                                            >
                                                                {
                                                                    category.nama_kategori
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </td>

                                            {/* Harga Beli */}
                                            <td className="border border-gray-300 px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={
                                                        formattedPrices[
                                                            index
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handlePriceChange(
                                                            index,
                                                            e
                                                        )
                                                    }
                                                    onFocus={() =>
                                                        handlePriceFocus(index)
                                                    }
                                                    onBlur={() =>
                                                        handlePriceBlur(index)
                                                    }
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:border-green-500 focus:outline-none"
                                                    placeholder="Rp 0"
                                                />
                                                <div className="text-xs text-gray-500 mt-1">
                                                    per satuan
                                                </div>
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
                                                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none ${
                                                        quantityErrors[index]
                                                            ? "border-red-500 focus:border-red-500"
                                                            : "border-gray-300 focus:border-green-500"
                                                    }`}
                                                    placeholder="0"
                                                    min={
                                                        itemDetails[index]
                                                            ?.minStock
                                                            ? itemDetails[index]
                                                                  .minStock
                                                            : "0"
                                                    }
                                                />
                                                {quantityErrors[index] && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {quantityErrors[index]}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Total Cost */}
                                            <td className="border border-gray-300 px-3 py-2">
                                                {itemDetails[index]?.harga &&
                                                itemDetails[index]?.jumlah ? (
                                                    <div className="bg-green-50 border border-green-200 rounded p-2">
                                                        <div className="text-xs text-gray-600 mb-1 font-semibold">
                                                            Total Cost
                                                        </div>
                                                        <div className="font-bold text-green-700 text-sm">
                                                            Rp{" "}
                                                            {(
                                                                parseFloat(
                                                                    itemDetails[
                                                                        index
                                                                    ]?.harga ||
                                                                        0
                                                                ) *
                                                                parseFloat(
                                                                    itemDetails[
                                                                        index
                                                                    ]?.jumlah ||
                                                                        0
                                                                )
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {
                                                                itemDetails[
                                                                    index
                                                                ]?.jumlah
                                                            }{" "}
                                                            × Rp{" "}
                                                            {parseFloat(
                                                                itemDetails[
                                                                    index
                                                                ]?.harga || 0
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400">
                                                        -
                                                    </div>
                                                )}
                                            </td>

                                            {/* Satuan */}
                                            <td className="border border-gray-300 px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={
                                                        itemDetails[index]
                                                            ?.unit || ""
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
                        <LoadingButton
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            variant="secondary"
                            className="flex-1"
                        >
                            Batal
                        </LoadingButton>
                        <LoadingButton
                            type="button"
                            onClick={handleConfirm}
                            disabled={
                                selectedItems.length === 0 || isSubmitting
                            }
                            loading={isSubmitting}
                            variant="success"
                            className="flex-1"
                        >
                            {selectedItems.length > 0
                                ? `Tambah ${selectedItems.length} Item ke Stok`
                                : "Pilih Item Terlebih Dahulu"}
                        </LoadingButton>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OcrReviewModal;
