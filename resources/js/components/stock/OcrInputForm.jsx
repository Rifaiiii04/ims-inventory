import React from "react";

function OcrInputForm({ ocrData, onImageUpload, onItemSelect }) {
    return (
        <div className="space-y-4">
            {/* OCR Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="mt-4">
                        <label
                            htmlFor="receipt-upload"
                            className="cursor-pointer"
                        >
                            <span className="mt-2 block text-lg font-medium text-gray-900">
                                Upload Foto Struk Belanja
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                                PNG, JPG, JPEG up to 10MB
                            </span>
                        </label>
                        <input
                            id="receipt-upload"
                            name="receipt-upload"
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            className="sr-only"
                            disabled={ocrData.isProcessing}
                        />
                    </div>
                </div>
            </div>

            {/* OCR Processing Status */}
            {ocrData.isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span className="text-sm text-blue-700">
                            Memproses struk belanja...
                        </span>
                    </div>
                </div>
            )}

            {/* OCR Error */}
            {ocrData.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error OCR
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                {ocrData.error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OCR Results */}
            {ocrData.items.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800 mb-3">
                        Item yang Ditemukan ({ocrData.items.length}):
                    </h3>
                    <div className="space-y-2">
                        {ocrData.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                            >
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {item.nama_barang}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Jumlah: {item.jumlah} | Harga: Rp{" "}
                                        {item.harga.toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-green-500">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-sm text-green-700">
                        ✅ Silakan review dan lengkapi data di modal yang muncul
                    </div>
                </div>
            )}

            {/* OCR Instructions */}
            {ocrData.items.length === 0 &&
                !ocrData.isProcessing &&
                !ocrData.error && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Cara Menggunakan OCR
                            </h3>
                            <div className="mt-2 text-sm text-gray-500">
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>
                                        Upload foto struk belanja yang jelas
                                    </li>
                                    <li>Tunggu sistem memproses gambar</li>
                                    <li>
                                        Pilih item yang ingin ditambahkan ke
                                        stok
                                    </li>
                                    <li>Form akan terisi otomatis</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default OcrInputForm;
