import React, { useState, useEffect } from "react";
import axios from "axios";
import InputModeToggle from "./InputModeToggle";
import ManualInputForm from "./ManualInputForm";
import PhotoInputForm from "./PhotoInputForm";
import OcrReviewModal from "./OcrReviewModal";
import LoadingButton from "../common/LoadingButton";
import { useToast } from "../../hooks/useToast";

function StockFormModal({ stock, onClose, onSubmit, categories = [] }) {
    const { showToast, ToastContainer } = useToast();

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

    const [ocrData, setOcrData] = useState({
        isProcessing: false,
        items: [],
        error: null,
    });

    const [inputMode, setInputMode] = useState("manual"); // 'manual' or 'photo'
    const [showOcrReview, setShowOcrReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (stock) {
            // Pastikan semua field ter-load dengan benar, termasuk boolean dan null values
            // ID bisa dari stock.id (dari API response) atau stock.id_bahan (fallback)
            const stockId = stock.id || stock.id_bahan || "";

            setFormData({
                id: stockId,
                name: stock.name || "",
                category_id: stock.category_id || stock.id_kategori || "",
                buyPrice: stock.buyPrice || stock.harga_beli || "",
                quantity: stock.quantity || stock.stok_bahan || "",
                unit: stock.unit || stock.satuan || "",
                minStock: stock.minStock || stock.min_stok || "",
                is_divisible:
                    stock.is_divisible === true ||
                    stock.is_divisible === 1 ||
                    stock.is_divisible === "1",
                max_divisions: stock.max_divisions || "",
                division_description: stock.division_description || "",
            });
        } else {
            // Reset form jika tidak ada stock (mode tambah)
            setFormData({
                id: "",
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
        }
    }, [stock]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Pastikan hanya mode manual yang bisa submit langsung
        if (inputMode !== "manual") {
            return;
        }

        // Validasi field required
        if (!formData.name || !formData.name.trim()) {
            showToast("Nama Stok harus diisi", "warning");
            return;
        }

        if (!formData.category_id) {
            showToast("Kategori harus dipilih", "warning");
            return;
        }

        if (!formData.buyPrice || parseFloat(formData.buyPrice) <= 0) {
            showToast("Harga Beli harus diisi dan lebih dari 0", "warning");
            return;
        }

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            showToast("Jumlah harus diisi dan lebih dari 0", "warning");
            return;
        }

        if (!formData.unit || !formData.unit.trim()) {
            showToast("Satuan harus diisi", "warning");
            return;
        }

        if (formData.minStock === "" || parseFloat(formData.minStock) < 0) {
            showToast(
                "Minimum Stock harus diisi dan tidak boleh negatif",
                "warning"
            );
            return;
        }

        // Validasi: Jumlah tidak boleh kurang dari Minimum Stock (hanya untuk mode tambah)
        if (!stock && formData.quantity && formData.minStock) {
            const quantity = parseFloat(formData.quantity) || 0;
            const minStock = parseFloat(formData.minStock) || 0;

            if (quantity < minStock) {
                showToast(
                    `Jumlah tidak boleh kurang dari Minimum Stock (${minStock}). Silakan perbaiki input Anda.`,
                    "warning"
                );
                return;
            }
        }

        // Validasi: jika mode edit, pastikan ID ada
        if (stock && !formData.id) {
            showToast(
                "Error: ID stok tidak ditemukan. Silakan tutup form dan coba lagi.",
                "error"
            );
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
            showToast(
                "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        setOcrData((prev) => ({ ...prev, isProcessing: true, error: null }));

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await axios.post(
                "/api/ocr/process-photo",
                formData
            );

            console.log("OCR Response:", response.data);
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (response.data.success) {
                console.log("OCR Items found:", response.data.data.items);
                console.log("Items count:", response.data.data.items.length);
                console.log("Items type:", typeof response.data.data.items);

                setOcrData({
                    isProcessing: false,
                    items: response.data.data.items || [],
                    error: null,
                });

                // Show review modal if items found
                if (
                    response.data.data.items &&
                    response.data.data.items.length > 0
                ) {
                    console.log(
                        "Showing OCR review modal with",
                        response.data.data.items.length,
                        "items"
                    );
                    setShowOcrReview(true);
                } else {
                    console.log(
                        "No items found in OCR response - items array is empty or undefined"
                    );
                    setOcrData({
                        isProcessing: false,
                        items: [],
                        error: "Tidak ada item yang ditemukan dalam foto. Coba foto yang lebih jelas.",
                    });
                }
            } else {
                console.log("OCR failed:", response.data.message);
                setOcrData({
                    isProcessing: false,
                    items: [],
                    error: response.data.message || "Photo processing failed",
                });
            }
        } catch (error) {
            console.error("Photo Upload Error:", error);

            let errorMessage = "Failed to process photo. Please try again.";

            if (error.response?.status === 503) {
                // OCR service is not available
                errorMessage =
                    error.response.data?.message ||
                    "OCR service tidak tersedia. Pastikan Python OCR service berjalan di port 5000. Jalankan: cd python_ocr_service && python ocr_service_hybrid.py";
            } else if (error.response?.status === 500) {
                // Get detailed error message from response
                const errorData = error.response?.data;
                if (errorData?.message) {
                    errorMessage = errorData.message;
                } else if (errorData?.error) {
                    errorMessage = errorData.error;
                } else {
                    errorMessage =
                        "Photo processing service error. Check server logs.";
                }

                // Add details if available
                if (errorData?.details) {
                    console.error(
                        "OCR Error Details:",
                        JSON.stringify(errorData.details, null, 2)
                    );
                }

                // Log full error response for debugging
                console.error(
                    "Full OCR Error Response:",
                    JSON.stringify(errorData, null, 2)
                );
            } else if (error.response?.status === 400) {
                errorMessage =
                    error.response.data?.message || "Invalid image format.";
            } else if (error.response?.status === 504) {
                errorMessage =
                    error.response.data?.message ||
                    "OCR processing timeout. Coba lagi dengan foto yang lebih kecil atau jelas.";
            } else if (error.code === "ERR_NETWORK") {
                errorMessage =
                    "Cannot connect to photo processing service. Pastikan OCR service berjalan.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setOcrData({
                isProcessing: false,
                items: [],
                error: errorMessage,
            });
        }
    };

    const handleOcrItemSelect = (item) => {
        setFormData((prev) => ({
            ...prev,
            name: item.nama_barang,
            quantity: item.jumlah.toString(),
            buyPrice: item.harga.toString(),
        }));
    };

    const handleOcrConfirmAdd = async (itemsToAdd) => {
        try {
            setIsSubmitting(true);
            const results = [];
            const errors = [];

            // Add each item to stock
            for (let i = 0; i < itemsToAdd.length; i++) {
                const item = itemsToAdd[i];

                try {
                    // Validate required fields first
                    if (!item.nama_barang || !item.nama_barang.trim()) {
                        console.warn("Skipping item with empty name:", item);
                        errors.push({
                            item: item.nama_barang || `Item ${i + 1}`,
                            error: "Nama barang kosong",
                        });
                        continue;
                    }

                    // Ensure category_id is valid - this is required by backend
                    let categoryId = item.category_id;

                    // Convert to number if it's a string
                    if (categoryId) {
                        categoryId = parseInt(categoryId);
                        if (isNaN(categoryId) || categoryId <= 0) {
                            categoryId = null; // Reset if invalid
                        }
                    }

                    // If no valid category_id, try to get from categories array
                    if (!categoryId && categories.length > 0) {
                        categoryId = parseInt(categories[0].id_kategori);
                        if (isNaN(categoryId) || categoryId <= 0) {
                            categoryId = null;
                        }
                    }

                    // If still no category_id, skip this item
                    if (!categoryId) {
                        console.warn("Skipping item with no valid category:", {
                            item: item.nama_barang,
                            itemCategoryId: item.category_id,
                            categoriesAvailable: categories.length,
                            firstCategory: categories[0]?.id_kategori,
                        });
                        errors.push({
                            item: item.nama_barang || `Item ${i + 1}`,
                            error: "Kategori tidak tersedia. Silakan pilih kategori terlebih dahulu.",
                        });
                        continue;
                    }

                    // Ensure data types are correct for backend validation
                    const stockData = {
                        name: String(item.nama_barang || "").trim(),
                        category_id: categoryId,
                        buyPrice: parseFloat(item.harga) || 0,
                        quantity: parseFloat(item.jumlah) || 1,
                        unit: String(item.unit || "pcs").trim(),
                        minStock: parseFloat(item.minStock) || 0,
                        is_divisible: false,
                        max_divisions: null,
                        division_description: null,
                        // Skip expired prediction untuk batch operations (prevent timeout)
                        skip_expired_prediction: itemsToAdd.length > 1,
                    };

                    // Ensure all numeric fields are properly formatted
                    stockData.buyPrice = parseFloat(stockData.buyPrice) || 0;
                    stockData.quantity = parseFloat(stockData.quantity) || 1;
                    stockData.minStock = parseFloat(stockData.minStock) || 0;

                    // Ensure unit is not empty
                    if (!stockData.unit || stockData.unit.trim() === "") {
                        stockData.unit = "pcs";
                    }

                    // Final validation: ensure category_id is a valid positive integer
                    if (!stockData.category_id || stockData.category_id <= 0) {
                        console.error(
                            "Invalid category_id in stockData:",
                            stockData
                        );
                        errors.push({
                            item: stockData.name,
                            error: "Kategori tidak valid",
                        });
                        continue;
                    }

                    // Verify category exists in categories array (double check)
                    const categoryExists = categories.some(
                        (cat) =>
                            parseInt(cat.id_kategori) === stockData.category_id
                    );
                    if (!categoryExists && categories.length > 0) {
                        console.warn(
                            `Category ${stockData.category_id} not found in categories array, using first category`
                        );
                        stockData.category_id = parseInt(
                            categories[0].id_kategori
                        );
                    }

                    console.log(
                        `[${i + 1}/${itemsToAdd.length}] Sending stock data:`,
                        stockData,
                        `Categories available: ${categories.length}`,
                        `Category IDs: ${categories
                            .map((c) => c.id_kategori)
                            .join(", ")}`
                    );
                    const result = await onSubmit(stockData);

                    if (result && !result.success) {
                        errors.push({
                            item: stockData.name,
                            error: result.message || "Gagal menambahkan stok",
                        });
                    } else {
                        results.push({
                            item: stockData.name,
                            success: true,
                        });
                    }
                } catch (error) {
                    console.error(`Error adding item ${i + 1}:`, error);
                    errors.push({
                        item: item.nama_barang || `Item ${i + 1}`,
                        error: error.message || "Terjadi kesalahan",
                    });
                }
            }

            // Show summary
            if (errors.length > 0) {
                const errorMsg = errors
                    .map((e) => `${e.item}: ${e.error}`)
                    .join(", ");
                showToast(
                    `Berhasil menambahkan ${results.length} item. ${errors.length} item gagal: ${errorMsg}`,
                    "warning",
                    8000
                );
            } else {
                // All successful
                if (results.length > 0) {
                    showToast(
                        `Berhasil menambahkan ${results.length} item ke stok!`,
                        "success"
                    );
                }
            }

            // Reset OCR data and close modals
            setOcrData({
                isProcessing: false,
                items: [],
                error: null,
            });
            setShowOcrReview(false);
            onClose();
        } catch (error) {
            console.error("Error adding OCR items:", error);
            showToast(
                "Terjadi kesalahan saat menambahkan item ke stok: " +
                    (error.message || error),
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer />
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
                        {/* Input Mode Toggle */}
                        <InputModeToggle
                            inputMode={inputMode}
                            onModeChange={setInputMode}
                        />

                        {/* Manual Input Mode */}
                        {inputMode === "manual" && (
                            <ManualInputForm
                                formData={formData}
                                onChange={handleChange}
                                categories={categories}
                                isEditMode={!!stock}
                            />
                        )}

                        {/* Photo Input Mode */}
                        {inputMode === "photo" && (
                            <PhotoInputForm
                                onImageUpload={handleImageUpload}
                                isProcessing={ocrData.isProcessing}
                                error={ocrData.error}
                            />
                        )}

                        {/* Modal Footer */}
                        <div className="flex gap-3 mt-6">
                            <LoadingButton
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                variant="secondary"
                                className="flex-1"
                            >
                                Batal
                            </LoadingButton>
                            {inputMode === "manual" && (
                                <LoadingButton
                                    type="submit"
                                    loading={isSubmitting}
                                    variant="success"
                                    className="flex-1"
                                >
                                    {stock ? "Update" : "Simpan"}
                                </LoadingButton>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* OCR Review Modal */}
            <OcrReviewModal
                isOpen={showOcrReview}
                onClose={() => setShowOcrReview(false)}
                ocrItems={ocrData.items}
                onConfirmAdd={handleOcrConfirmAdd}
                categories={categories}
            />
        </>
    );
}

export default StockFormModal;
