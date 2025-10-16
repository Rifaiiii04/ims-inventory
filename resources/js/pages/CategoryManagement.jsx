import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import CategoryTable from "../components/category/CategoryTable";
import CategoryFormModal from "../components/category/CategoryFormModal";

function CategoryManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Dummy data kategori
    const [categoryData, setCategoryData] = useState([
        {
            id: 1,
            name: "Makanan",
            productCount: 10,
            description: "Produk makanan siap saji seperti nasi, mie, dll",
        },
        {
            id: 2,
            name: "Minuman",
            productCount: 8,
            description: "Berbagai jenis minuman panas dan dingin",
        },
        {
            id: 3,
            name: "Snack",
            productCount: 5,
            description: "Makanan ringan dan cemilan",
        },
    ]);

    const handleAddCategory = (newCategory) => {
        const category = {
            ...newCategory,
            id: categoryData.length + 1,
            productCount: 0,
        };
        setCategoryData([...categoryData, category]);
        setShowFormModal(false);
    };

    const handleUpdateCategory = (updatedCategory) => {
        setCategoryData(
            categoryData.map((item) =>
                item.id === updatedCategory.id ? updatedCategory : item
            )
        );
        setEditingCategory(null);
        setShowFormModal(false);
    };

    const handleDeleteCategory = (id) => {
        const category = categoryData.find((c) => c.id === id);
        if (category.productCount > 0) {
            alert(
                `Tidak bisa menghapus kategori "${category.name}" karena masih ada ${category.productCount} produk!`
            );
            return;
        }
        if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
            setCategoryData(categoryData.filter((item) => item.id !== id));
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowFormModal(true);
    };

    return (
        <>
            <div className="w-screen h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
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

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto md:p-3">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 mt-16 md:mt-0">
                        {/* Header */}
                        <div className="mb-6 bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1
                                        className="text-xl md:text-2xl font-bold mb-1"
                                        style={{ color: "#16A34A" }}
                                    >
                                        Manajemen Kategori
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Kelola kategori produk
                                        (Makanan/Minuman/Snack)
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setShowFormModal(true);
                                    }}
                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
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
                                    Tambah Kategori
                                </button>
                            </div>
                        </div>

                        {/* Category Table */}
                        <CategoryTable
                            data={categoryData}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showFormModal && (
                <CategoryFormModal
                    category={editingCategory}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingCategory(null);
                    }}
                    onSubmit={
                        editingCategory
                            ? handleUpdateCategory
                            : handleAddCategory
                    }
                />
            )}
        </>
    );
}

export default CategoryManagement;
