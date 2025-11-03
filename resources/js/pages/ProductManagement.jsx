import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProductTable from "../components/product/ProductTable";
import ProductFormModal from "../components/product/ProductFormModal";
import { useProduct } from "../hooks/useProduct";
import { ManagementPageSkeleton } from "../components/common/SkeletonLoader";

function ProductManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Use product hook for real data
    const {
        products: productData,
        categories,
        ingredients,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        refreshData,
    } = useProduct();

    // Handle tambah produk baru
    const handleAddProduct = async (newProduct) => {
        const result = await createProduct(newProduct);
        if (result.success) {
            setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle update produk
    const handleUpdateProduct = async (updatedProduct) => {
        const result = await updateProduct(updatedProduct.id, updatedProduct);
        if (result.success) {
            setEditingProduct(null);
            setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle hapus produk
    const handleDeleteProduct = async (id) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus produk ini? Semua varian dan komposisi terkait juga akan dihapus."
            )
        ) {
            const result = await deleteProduct(id);
            if (!result.success) {
                alert(`Error: ${result.message}`);
            }
        }
    };

    // Handle edit produk
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    // Filter products based on search term
    const filteredProducts = (productData || []).filter((product) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            product.name?.toLowerCase().includes(searchLower) ||
            product.category_name?.toLowerCase().includes(searchLower) ||
            (product.unique_ingredients &&
                Array.isArray(product.unique_ingredients) &&
                product.unique_ingredients.some((ingredient) =>
                    ingredient?.toLowerCase().includes(searchLower)
                ))
        );
    });

    return (
        <>
            <div className="w-screen h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-6 text-gray-700"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

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

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <TopBar
                        title="Manajemen Produk"
                        subtitle="Kelola semua produk makanan dan minuman"
                        buttonText="Tambah Produk"
                        buttonIcon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                />
                            </svg>
                        }
                        onButtonClick={() => {
                            setEditingProduct(null);
                            setShowFormModal(true);
                        }}
                        buttonColor="green"
                        showSearch={true}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Cari produk, kategori, atau bahan..."
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* Error State */}
                        {error && (
                            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                                            Terjadi Kesalahan
                                        </h3>
                                        <p className="text-xs sm:text-sm text-red-600 break-words">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Results Info */}
                        {!loading && searchTerm && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-blue-600 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    <span className="text-xs sm:text-sm text-blue-800 break-words">
                                        Menampilkan {filteredProducts.length}{" "}
                                        dari {productData?.length || 0} produk
                                        untuk pencarian "{searchTerm}"
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* No Search Results */}
                        {!loading &&
                            searchTerm &&
                            filteredProducts.length === 0 && (
                                <div className="text-center py-8 sm:py-12">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <svg
                                            className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">
                                        Tidak ada hasil ditemukan
                                    </h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 px-4">
                                        Tidak ada produk yang cocok dengan
                                        pencarian "{searchTerm}"
                                    </p>
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                                    >
                                        Hapus Pencarian
                                    </button>
                                </div>
                            )}

                        {/* Loading State - Show skeleton if loading and no data */}
                        {loading && (!productData || productData.length === 0) && !error && (
                            <ManagementPageSkeleton title="Manajemen Produk" />
                        )}

                        {/* Product Table */}
                        {!loading && productData && productData.length > 0 && (
                            <div className="overflow-x-auto">
                                <ProductTable
                                    data={filteredProducts}
                                    categories={categories}
                                    onEdit={handleEditProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            </div>
                        )}

                        {/* No Data State */}
                        {!loading && !productData && !error && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-700 mb-2">
                                    Belum ada produk
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Mulai dengan menambahkan produk pertama
                                </p>
                                <button
                                    onClick={() => setShowFormModal(true)}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Tambah Produk
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFormModal && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories}
                    ingredients={ingredients}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingProduct(null);
                    }}
                    onSubmit={
                        editingProduct ? handleUpdateProduct : handleAddProduct
                    }
                />
            )}
        </>
    );
}

export default ProductManagement;
