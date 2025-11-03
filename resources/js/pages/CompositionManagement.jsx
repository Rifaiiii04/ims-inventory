import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import CompositionTable from "../components/composition/CompositionTable";
import CompositionFormModal from "../components/composition/CompositionFormModal";
import CompositionDetailModal from "../components/composition/CompositionDetailModal";
import { useComposition } from "../hooks/useComposition";
import { ManagementPageSkeleton } from "../components/common/SkeletonLoader";
import MobileSidebarToggle from "../components/sidebar/MobileSidebarToggle";

function CompositionManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingComposition, setEditingComposition] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedComposition, setSelectedComposition] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Use composition hook for real data
    const {
        compositions: compositionData,
        variants,
        products,
        ingredients,
        loading,
        error,
        createComposition,
        updateComposition,
        deleteComposition,
        refreshData,
    } = useComposition();

    // Handle tambah komposisi baru
    const handleAddComposition = async (newComposition) => {
        const result = await createComposition(newComposition);
        if (result.success) {
            setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle update komposisi
    const handleUpdateComposition = async (updatedComposition) => {
        const result = await updateComposition(
            updatedComposition.id,
            updatedComposition
        );
        if (result.success) {
            setEditingComposition(null);
            setShowFormModal(false);
        } else {
            alert(result.message);
        }
    };

    // Handle hapus komposisi
    const handleDeleteComposition = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus komposisi ini?")) {
            const result = await deleteComposition(id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    // Handle edit komposisi
    const handleEditComposition = (composition) => {
        setEditingComposition(composition);
        setShowFormModal(true);
    };

    // Handle lihat detail komposisi
    const handleViewDetail = (composition) => {
        setSelectedComposition(composition);
        setShowDetailModal(true);
    };

    // Filter compositions based on search term
    const filteredCompositions = (
        Array.isArray(compositionData) ? compositionData : []
    ).filter((composition) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const matchesProduct = composition.product_name?.toLowerCase().includes(searchLower);
        const matchesVariant = composition.variant_name?.toLowerCase().includes(searchLower);
        
        // Cek apakah ada bahan yang cocok
        const matchesIngredient = composition.ingredients?.some(ingredient => 
            ingredient.ingredient_name?.toLowerCase().includes(searchLower)
        ) || false;
        
        return matchesProduct || matchesVariant || matchesIngredient;
    });

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
                        title="Manajemen Komposisi"
                        subtitle="Kelola komposisi bahan untuk produk dan varian"
                        buttonText="Tambah Komposisi"
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
                            setEditingComposition(null);
                            setShowFormModal(true);
                        }}
                        buttonColor="green"
                        showSearch={true}
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Cari komposisi, varian, atau bahan..."
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
                                        Menampilkan{" "}
                                        {filteredCompositions.length} dari{" "}
                                        {Array.isArray(compositionData)
                                            ? compositionData.length
                                            : 0}{" "}
                                        komposisi untuk pencarian "{searchTerm}"
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* No Search Results */}
                        {!loading &&
                            searchTerm &&
                            filteredCompositions.length === 0 && (
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
                                        Tidak ada komposisi yang cocok dengan
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
                        {loading && (!compositionData || compositionData.length === 0) && !error && (
                            <ManagementPageSkeleton title="Manajemen Komposisi" />
                        )}

                        {/* Composition Table */}
                        {!loading && (
                            <div className="overflow-x-auto">
                                <CompositionTable
                                    data={filteredCompositions}
                                    onEdit={handleEditComposition}
                                    onDelete={handleDeleteComposition}
                                    onViewDetail={handleViewDetail}
                                />
                            </div>
                        )}

                        {/* No Data State */}
                        {!loading &&
                            (!Array.isArray(compositionData) ||
                                compositionData.length === 0) &&
                            !error && (
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
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                                        Belum ada komposisi
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Mulai dengan menambahkan komposisi
                                        pertama
                                    </p>
                                    <button
                                        onClick={() => setShowFormModal(true)}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Tambah Komposisi
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFormModal && (
                <CompositionFormModal
                    composition={editingComposition}
                    variants={variants}
                    products={products}
                    ingredients={ingredients}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingComposition(null);
                    }}
                    onSubmit={
                        editingComposition
                            ? handleUpdateComposition
                            : handleAddComposition
                    }
                />
            )}

            {showDetailModal && (
                <CompositionDetailModal
                    composition={selectedComposition}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedComposition(null);
                    }}
                />
            )}
        </>
    );
}

export default CompositionManagement;
