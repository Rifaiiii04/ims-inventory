import React, { useState } from "react";

function PaymentModal({ total, onProcess, onClose, isProcessing = false }) {
    const [paymentMethod, setPaymentMethod] = useState("tunai");
    const [cashAmount, setCashAmount] = useState("");
    const [transferProof, setTransferProof] = useState("");

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    // Format cash amount for display with Rp prefix
    const formatCashAmount = (value) => {
        if (!value) return "";
        // Remove all non-digit characters
        const numericValue = value.replace(/\D/g, "");
        if (!numericValue) return "";
        // Format with thousand separators
        return "Rp " + numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Parse cash amount from formatted string
    const parseCashAmount = (value) => {
        if (!value) return "";
        // Remove Rp and all non-digit characters
        return value.replace(/Rp\s?/g, "").replace(/\D/g, "");
    };

    const numericCashAmount = cashAmount ? parseFloat(parseCashAmount(cashAmount)) : 0;
    const change = numericCashAmount ? numericCashAmount - total : 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prevent double submission
        if (isProcessing) {
            return;
        }

        if (
            paymentMethod === "tunai" &&
            (!cashAmount || numericCashAmount < total)
        ) {
            alert("Jumlah tunai tidak mencukupi");
            return;
        }

        if (paymentMethod === "transfer" && !transferProof.trim()) {
            alert("Mohon masukkan bukti transfer");
            return;
        }

        onProcess({
            method: paymentMethod,
            cashAmount:
                paymentMethod === "tunai" ? numericCashAmount : null,
            transferProof: paymentMethod === "transfer" ? transferProof : null,
        });
    };

    const handleCashAmountChange = (e) => {
        const inputValue = e.target.value;
        // Remove existing formatting to get raw input
        const rawValue = parseCashAmount(inputValue);
        // Format with Rp prefix
        const formatted = rawValue ? formatCashAmount(rawValue) : "";
        setCashAmount(formatted);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-5 border-b border-gray-200 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Pembayaran
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Pilih metode pembayaran
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
                                isProcessing ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Total Amount */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-800">
                                Total Pembayaran:
                            </span>
                            <span className="text-2xl font-bold text-green-600">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Metode Pembayaran
                        </label>
                        <div className="space-y-3">
                            <label className={`flex items-center p-3 border-2 rounded-lg transition-all duration-200 ${
                                isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="tunai"
                                    checked={paymentMethod === "tunai"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        💵
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-800">
                                            Tunai
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            Pembayaran dengan uang tunai
                                        </p>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-center p-3 border-2 rounded-lg transition-all duration-200 ${
                                isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="qris"
                                    checked={paymentMethod === "qris"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        📱
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-800">
                                            QRIS
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            Scan QR code untuk pembayaran
                                        </p>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex items-center p-3 border-2 rounded-lg transition-all duration-200 ${
                                isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
                            }`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="transfer"
                                    checked={paymentMethod === "transfer"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <div className="ml-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        🏦
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-800">
                                            Transfer
                                        </span>
                                        <p className="text-sm text-gray-500">
                                            Transfer bank dengan bukti
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Cash Amount Input */}
                    {paymentMethod === "tunai" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Jumlah Tunai
                            </label>
                            <input
                                type="text"
                                value={cashAmount}
                                onChange={handleCashAmountChange}
                                placeholder="Rp 0"
                                disabled={isProcessing}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    isProcessing ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                                required
                            />
                            {cashAmount && change >= 0 && (
                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-green-700">
                                            Kembalian:
                                        </span>
                                        <span className="font-bold text-green-600">
                                            {formatPrice(change)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {cashAmount && change < 0 && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        Jumlah tunai tidak mencukupi. Kurang{" "}
                                        {formatPrice(Math.abs(change))}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transfer Proof Input */}
                    {paymentMethod === "transfer" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Bukti Transfer
                            </label>
                            <textarea
                                value={transferProof}
                                onChange={(e) =>
                                    setTransferProof(e.target.value)
                                }
                                placeholder="Masukkan nomor rekening atau bukti transfer"
                                rows={3}
                                disabled={isProcessing}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    isProcessing ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                                required
                            />
                        </div>
                    )}

                    {/* QRIS Display */}
                    {paymentMethod === "qris" && (
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📱</div>
                                    <p className="text-xs text-gray-500">
                                        QR Code
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Scan QR code di atas untuk melakukan pembayaran
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className={`px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-semibold transition-colors ${
                                isProcessing 
                                    ? "opacity-50 cursor-not-allowed" 
                                    : "hover:bg-gray-200"
                            }`}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 ${
                                isProcessing 
                                    ? "opacity-75 cursor-not-allowed" 
                                    : "hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
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
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                "Proses Pembayaran"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PaymentModal;
