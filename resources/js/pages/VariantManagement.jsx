import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import VariantTable from "../components/variant/VariantTable";
import VariantFormModal from "../components/variant/VariantFormModal";

function VariantManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [variantData, setVariantData] = useState([
        {
            id: 1,
            name: "Bakar",
            productName: "Ayam",
            price: 18000,
            description: "Ayam dibakar dengan bumbu spesial",
        },
        {
            id: 2,
            name: "Goreng",
            productName: "Ayam",
            price: 15000,
            description: "Ayam goreng crispy",
        },
        {
            id: 3,
            name: "Manis",
            productName: "Es Teh",
            price: 3000,
            description: "Dengan gula",
        },
        {
            id: 4,
            name: "Tawar",
            productName: "Es Teh",
            price: 2000,
            description: "Tanpa gula",
        },
    ]);

    const handleAddVariant = (newVariant) => {
        setVariantData([
            ...variantData,
            { ...newVariant, id: variantData.length + 1 },
        ]);
        setShowFormModal(false);
    };

    const handleUpdateVariant = (updatedVariant) => {
        setVariantData(
            variantData.map((item) =>
                item.id === updatedVariant.id ? updatedVariant : item
            )
        );
        setEditingVariant(null);
        setShowFormModal(false);
    };

    const handleDeleteVariant = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus varian ini?")) {
            setVariantData(variantData.filter((item) => item.id !== id));
        }
    };

    const handleEditVariant = (variant) => {
        setEditingVariant(variant);
        setShowFormModal(true);
    };

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500"
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
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                </svg>
            </button>

            <div
                className={`fixed md:relative md:block z-40 transition-transform duration-300 h-full ${
                    isMobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                }`}
            >
                <div className="h-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 md:bg-transparent">
                    <Sidebar />
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className="flex-1 overflow-y-auto md:p-3">
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 mt-16 md:mt-0">
                    <div className="mb-6 bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1
                                    className="text-xl md:text-2xl font-bold mb-1"
                                    style={{ color: "#16A34A" }}
                                >
                                    Manajemen Varian Produk
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Kelola varian produk (Bakar/Goreng,
                                    Manis/Tawar, dll)
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingVariant(null);
                                    setShowFormModal(true);
                                }}
                                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="size-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Tambah Varian
                            </button>
                        </div>
                    </div>

                    <VariantTable
                        data={variantData}
                        onEdit={handleEditVariant}
                        onDelete={handleDeleteVariant}
                    />
                </div>
            </div>

            {showFormModal && (
                <VariantFormModal
                    variant={editingVariant}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingVariant(null);
                    }}
                    onSubmit={
                        editingVariant ? handleUpdateVariant : handleAddVariant
                    }
                />
            )}
        </div>
    );
}

export default VariantManagement;
