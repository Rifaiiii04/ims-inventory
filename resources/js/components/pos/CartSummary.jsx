import React from "react";

function CartSummary({ cart, total, onUpdateQuantity, onRemoveItem, onCheckout, disabled }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Keranjang</h3>
                <p className="text-sm text-gray-600">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} dalam keranjang
                </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Keranjang Kosong</h4>
                        <p className="text-sm text-gray-500">
                            Pilih produk untuk memulai transaksi
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-800 text-sm">
                                            {item.product && item.product.name 
                                                ? `${item.product.name} - ${item.variant.nama_varian}`
                                                : item.variant.nama_varian
                                            }
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                            {formatPrice(item.price)} per item
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveItem(item.variant.id_varian)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Hapus item"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onUpdateQuantity(item.variant.id_varian, item.quantity - 1)}
                                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.variant.id_varian, item.quantity + 1)}
                                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600 text-sm">
                                            {formatPrice(item.subtotal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Total and Checkout */}
            {cart.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-800">Total:</span>
                        <span className="text-xl font-bold text-green-600">
                            {formatPrice(total)}
                        </span>
                    </div>
                    
                    <button
                        onClick={onCheckout}
                        disabled={disabled}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            disabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        }`}
                    >
                        Proses Pembayaran
                    </button>
                </div>
            )}
        </div>
    );
}

export default CartSummary;
