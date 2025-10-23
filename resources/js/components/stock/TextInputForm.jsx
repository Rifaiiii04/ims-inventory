import React, { useState } from "react";

function TextInputForm({ onSubmit, onCancel, categories = [] }) {
    const [text, setText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim()) {
            setError("Silakan masukkan text struk belanja");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            const response = await fetch("/api/ocr/process-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({ text: text.trim() }),
            });

            const result = await response.json();

            if (result.success && result.data.items.length > 0) {
                // Transform data untuk kompatibilitas dengan OcrReviewModal
                const ocrItems = result.data.items.map((item) => ({
                    nama_barang: item.nama_barang,
                    jumlah: item.jumlah.toString(),
                    harga: item.harga.toString(),
                }));

                onSubmit(ocrItems);
            } else {
                setError(
                    result.message || "Tidak ada item yang ditemukan dalam text"
                );
            }
        } catch (err) {
            console.error("Error processing text:", err);
            setError("Gagal memproses text. Silakan coba lagi.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-blue-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Input Text Struk Belanja
                </h3>
                <p className="text-sm text-gray-600">
                    Masukkan text dari struk belanja untuk diproses dengan AI
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Text Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Text Struk Belanja *
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Contoh:
TOKO ANGKRINGAN
================================
Nasi Goreng       1 x 15000
Es Teh           2 x 5000
Kerupuk          1 x 3000
================================
Total: Rp 28000"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
                        rows={8}
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Masukkan text struk belanja dengan format yang jelas
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex">
                            <svg
                                className="w-5 h-5 text-red-400 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="ml-2">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isProcessing || !text.trim()}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                Memproses...
                            </>
                        ) : (
                            "Proses Text"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TextInputForm;
