import React from "react";

function TransactionDetailModal({ transaction, onClose }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getPaymentMethodText = (method) => {
        const methods = {
            cash: "Tunai",
            qris: "QRIS",
            lainnya: "Transfer Bank",
        };
        return methods[method] || method;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {
        const message = `Struk Transaksi\n\nNo. Transaksi: TRX${
            transaction.id_transaksi
        }\nTanggal: ${formatDate(
            transaction.tanggal_waktu
        )}\nTotal: ${formatPrice(
            transaction.total_transaksi
        )}\nMetode: ${getPaymentMethodText(
            transaction.metode_bayar
        )}\n\nTerima kasih!`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Detail Transaksi
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Struk transaksi lengkap
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

                {/* Receipt Content */}
                <div className="p-6 space-y-6">
                    {/* Transaction Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-bold text-gray-800 mb-3">
                            Informasi Transaksi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">
                                    Nomor Transaksi:
                                </span>
                                <span className="font-semibold ml-2">
                                    TRX{transaction.id_transaksi}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Waktu:</span>
                                <span className="font-semibold ml-2">
                                    {formatDate(transaction.tanggal_waktu)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Metode Pembayaran:
                                </span>
                                <span className="font-semibold ml-2">
                                    {getPaymentMethodText(
                                        transaction.metode_bayar
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Kasir:</span>
                                <span className="font-semibold ml-2">
                                    {transaction.user?.nama_user || "Unknown"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3">
                            Daftar Item
                        </h4>
                        <div className="space-y-2">
                            {transaction.details?.map((detail, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center py-2 border-b border-gray-100"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">
                                            {detail.variant?.nama_varian ||
                                                "Unknown Item"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatPrice(detail.harga_satuan)} x{" "}
                                            {detail.jumlah}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">
                                            {formatPrice(detail.total_harga)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">
                                Total Pembayaran:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                                {formatPrice(transaction.total_transaksi)}
                            </span>
                        </div>
                        {transaction.catatan && (
                            <div className="mt-2">
                                <span className="text-sm text-gray-600">
                                    Catatan:
                                </span>
                                <p className="text-sm text-gray-700 mt-1">
                                    {transaction.catatan}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Thank You Message */}
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                            Terima kasih telah berbelanja di Angkringan!
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Silakan datang kembali
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            Cetak Struk
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            WhatsApp
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-3 px-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TransactionDetailModal;
