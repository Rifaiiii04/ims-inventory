import React, { useState, useEffect } from "react";
import axios from "axios";
import InputModeToggle from "./InputModeToggle";
import ManualInputForm from "./ManualInputForm";
import PhotoInputForm from "./PhotoInputForm";
import OcrReviewModal from "./OcrReviewModal";

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

    const [ocrData, setOcrData] = useState({
        isProcessing: false,
        items: [],
        error: null,
    });

    const [inputMode, setInputMode] = useState("manual"); // 'manual' or 'photo'
    const [showOcrReview, setShowOcrReview] = useState(false);

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
                errorMessage = error.response.data?.message || 
                    "OCR service tidak tersedia. Pastikan Python OCR service berjalan di port 5000. Jalankan: cd python_ocr_service && python ocr_service_hybrid.py";
            } else if (error.response?.status === 500) {
                // Get detailed error message from response
                const errorData = error.response?.data;
                if (errorData?.message) {
                    errorMessage = errorData.message;
                } else if (errorData?.error) {
                    errorMessage = errorData.error;
                } else {
                    errorMessage = "Photo processing service error. Check server logs.";
                }
                
                // Add details if available
                if (errorData?.details) {
                    console.error("OCR Error Details:", JSON.stringify(errorData.details, null, 2));
                }
                
                // Log full error response for debugging
                console.error("Full OCR Error Response:", JSON.stringify(errorData, null, 2));
            } else if (error.response?.status === 400) {
                errorMessage =
                    error.response.data?.message || "Invalid image format.";
            } else if (error.response?.status === 504) {
                errorMessage = error.response.data?.message || 
                    "OCR processing timeout. Coba lagi dengan foto yang lebih kecil atau jelas.";
            } else if (error.code === "ERR_NETWORK") {
                errorMessage = "Cannot connect to photo processing service. Pastikan OCR service berjalan.";
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
            // Add each item to stock
            for (const item of itemsToAdd) {
                // Ensure data types are correct for backend validation
                const stockData = {
                    name: String(item.nama_barang || '').trim(),
                    category_id: item.category_id || (categories.length > 0 ? categories[0].id : 1),
                    buyPrice: parseFloat(item.harga) || 0,
                    quantity: parseFloat(item.jumlah) || 1,
                    unit: String(item.unit || 'pcs').trim(),
                    minStock: parseFloat(item.minStock) || 10,
                    is_divisible: false,
                    max_divisions: null,
                    division_description: null,
                };

                // Validate required fields
                if (!stockData.name) {
                    console.warn('Skipping item with empty name:', item);
                    continue;
                }

                await onSubmit(stockData);
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
            alert("Terjadi kesalahan saat menambahkan item ke stok");
        }
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

            {/* OCR Review Modal */}
            <OcrReviewModal
                isOpen={showOcrReview}
                onClose={() => setShowOcrReview(false)}
                ocrItems={ocrData.items}
                onConfirmAdd={handleOcrConfirmAdd}
                categories={categories}
            />
        </div>
    );
}

export default StockFormModal;
