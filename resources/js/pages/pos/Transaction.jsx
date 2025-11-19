import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { useTransaction } from "../../hooks/useTransaction";
import ProductSelector from "../../components/pos/ProductSelector";
import CartSummary from "../../components/pos/CartSummary";
import PaymentModal from "../../components/pos/PaymentModal";
import ReceiptModal from "../../components/pos/ReceiptModal";
import MobileSidebarToggle from "../../components/sidebar/MobileSidebarToggle";

function Transaction() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [transactionData, setTransactionData] = useState(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Auto-close mobile menu saat resize ke desktop dan pastikan tidak stuck
    useEffect(() => {
        const checkDesktop = () => {
            const desktop = window.innerWidth >= 1024; // lg breakpoint
            setIsDesktop(desktop);
            if (desktop) {
                setIsMobileMenuOpen(false);
            }
        };

        // Check on mount
        checkDesktop();

        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);
    
    const {
        products,
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        processTransaction
    } = useTransaction();

    const handleProcessTransaction = async (paymentData) => {
        // Prevent double click
        if (isProcessingPayment) {
            return;
        }

        setIsProcessingPayment(true);
        try {
            const result = await processTransaction(paymentData);
            if (result.success) {
                setTransactionData(result.data);
                setShowPaymentModal(false);
                setShowReceiptModal(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error processing transaction:", error);
            alert("Terjadi kesalahan saat memproses transaksi. Silakan coba lagi.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCloseReceipt = () => {
        setShowReceiptModal(false);
        setTransactionData(null);
        clearCart();
    };

    // Show loading only if no products loaded (initial load)
    if (loading && products.length === 0) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <TopBar
                            title="Transaksi POS"
                            subtitle="Sistem Point of Sale untuk kasir"
                            showLiveIndicator={true}
                        />
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Memuat data produk...</p>
                                <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Terjadi Kesalahan</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                <MobileSidebarToggle
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Sidebar */}
                <div
                    className={`fixed lg:relative lg:block z-40 transition-transform duration-300 h-full ${
                        isMobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="h-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 lg:bg-transparent">
                        <Sidebar />
                    </div>
                </div>

                {/* Mobile Overlay - hanya muncul di mobile dan saat menu terbuka */}
                {isMobileMenuOpen && !isDesktop && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                        onTouchStart={() => setIsMobileMenuOpen(false)}
                        style={{ pointerEvents: 'auto' }}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <TopBar
                        title="Transaksi POS"
                        subtitle="Sistem Point of Sale untuk kasir"
                        showLiveIndicator={true}
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                            {/* Product Selection */}
                            <div className="lg:col-span-2">
                                <ProductSelector
                                    products={products}
                                    onAddToCart={addToCart}
                                />
                            </div>

                            {/* Cart Summary */}
                            <div className="lg:col-span-1">
                                <CartSummary
                                    cart={cart}
                                    total={getTotal()}
                                    onUpdateQuantity={updateQuantity}
                                    onRemoveItem={removeFromCart}
                                    onCheckout={() => setShowPaymentModal(true)}
                                    disabled={cart.length === 0}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    total={getTotal()}
                    onProcess={handleProcessTransaction}
                    onClose={() => {
                        if (!isProcessingPayment) {
                            setShowPaymentModal(false);
                        }
                    }}
                    isProcessing={isProcessingPayment}
                />
            )}

            {/* Receipt Modal */}
            {showReceiptModal && transactionData && (
                <ReceiptModal
                    transaction={transactionData}
                    cart={cart}
                    onClose={handleCloseReceipt}
                />
            )}
        </>
    );
}

export default Transaction;
