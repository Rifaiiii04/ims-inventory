import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ProductTable from "../components/product/ProductTable";
import ProductFormModal from "../components/product/ProductFormModal";
import ProductHistoryModal from "../components/product/ProductHistoryModal";

function ProductManagement() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProductHistory, setSelectedProductHistory] = useState(null);

    // Data produk berdasarkan menu observasi Kedai Angkringan Prasmanan
    const [productData, setProductData] = useState([
        {
            id: 1,
            name: "Nasi",
            category: "Makanan",
            ingredients: ["Beras"],
            initialStock: 120,
            sellPrice: 5000,
            variants: [{ name: "Porsi", price: 5000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 2,
            name: "Ayam Bakar",
            category: "Makanan",
            ingredients: ["Ayam Utuh", "Bumbu Halus", "Rempah Kering"],
            initialStock: 12,
            sellPrice: 17000,
            variants: [{ name: "Porsi", price: 17000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 3,
            name: "Ayam Goreng",
            category: "Makanan",
            ingredients: ["Ayam Utuh", "Bumbu Halus", "Rempah Kering"],
            initialStock: 12,
            sellPrice: 16000,
            variants: [{ name: "Porsi", price: 16000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 4,
            name: "Tusukan (Sate-satean)",
            category: "Makanan",
            ingredients: ["Cumi", "Bumbu Halus"],
            initialStock: 30,
            sellPrice: 3000,
            variants: [{ name: "Tusuk", price: 3000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 5,
            name: "Lele Goreng",
            category: "Makanan",
            ingredients: ["Lele", "Bumbu Halus", "Rempah Kering"],
            initialStock: 10,
            sellPrice: 10000,
            variants: [{ name: "Porsi", price: 10000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 6,
            name: "Nila Goreng",
            category: "Makanan",
            ingredients: ["Nila", "Bumbu Halus", "Rempah Kering"],
            initialStock: 8,
            sellPrice: 18000,
            variants: [{ name: "Porsi", price: 18000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 7,
            name: "Cobek Nila",
            category: "Makanan",
            ingredients: ["Nila", "Bumbu Halus", "Rempah Kering"],
            initialStock: 8,
            sellPrice: 23000,
            variants: [{ name: "Porsi", price: 23000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 8,
            name: "Kepala Ayam",
            category: "Makanan",
            ingredients: ["Ayam Utuh", "Bumbu Halus"],
            initialStock: 10,
            sellPrice: 2000,
            variants: [{ name: "Porsi", price: 2000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 9,
            name: "Tempe Goreng",
            category: "Makanan",
            ingredients: ["Tempe Bumbu Kuning", "Bumbu Halus"],
            initialStock: 25,
            sellPrice: 1000,
            variants: [{ name: "Porsi", price: 1000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 10,
            name: "Tahu Goreng",
            category: "Makanan",
            ingredients: ["Tahu Bumbu Kuning", "Bumbu Halus"],
            initialStock: 25,
            sellPrice: 1000,
            variants: [{ name: "Porsi", price: 1000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 11,
            name: "Cumi Goreng",
            category: "Makanan",
            ingredients: ["Cumi", "Bumbu Halus", "Rempah Kering"],
            initialStock: 30,
            sellPrice: 8000,
            variants: [{ name: "Porsi", price: 8000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 12,
            name: "Pencok",
            category: "Makanan",
            ingredients: ["Bumbu Halus", "Rempah Kering"],
            initialStock: 20,
            sellPrice: 8000,
            variants: [{ name: "Porsi", price: 8000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 13,
            name: "Receuh Timun",
            category: "Makanan",
            ingredients: ["Timun", "Bumbu Halus"],
            initialStock: 10,
            sellPrice: 8000,
            variants: [{ name: "Porsi", price: 8000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 14,
            name: "Asin Japuh",
            category: "Makanan",
            ingredients: ["Ikan Asin Japuh"],
            initialStock: 10,
            sellPrice: 5000,
            variants: [{ name: "Porsi", price: 5000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 15,
            name: "Asin Peda",
            category: "Makanan",
            ingredients: ["Ikan Asin Peda"],
            initialStock: 10,
            sellPrice: 8000,
            variants: [{ name: "Porsi", price: 8000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 16,
            name: "Asin Pindang",
            category: "Makanan",
            ingredients: ["Ikan Asin Pindang"],
            initialStock: 10,
            sellPrice: 8000,
            variants: [{ name: "Porsi", price: 8000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 17,
            name: "Tumis Kangkung",
            category: "Makanan",
            ingredients: ["Kangkung", "Bumbu Halus"],
            initialStock: 10,
            sellPrice: 10000,
            variants: [{ name: "Porsi", price: 10000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 18,
            name: "Tumis Terong",
            category: "Makanan",
            ingredients: ["Terong", "Bumbu Halus"],
            initialStock: 10,
            sellPrice: 10000,
            variants: [{ name: "Porsi", price: 10000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 19,
            name: "Es Teh Manis",
            category: "Minuman",
            ingredients: ["Teh", "Gula", "Es Batu"],
            initialStock: 50,
            sellPrice: 5000,
            variants: [{ name: "Gelas", price: 5000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 20,
            name: "Es Teh Tawar",
            category: "Minuman",
            ingredients: ["Teh", "Es Batu"],
            initialStock: 50,
            sellPrice: 2000,
            variants: [{ name: "Gelas", price: 2000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 21,
            name: "Es Teh Jus",
            category: "Minuman",
            ingredients: ["Teh", "Jus", "Es Batu"],
            initialStock: 50,
            sellPrice: 4000,
            variants: [{ name: "Gelas", price: 4000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
        {
            id: 22,
            name: "Es Jeruk",
            category: "Minuman",
            ingredients: ["Jeruk", "Gula", "Es Batu"],
            initialStock: 10,
            sellPrice: 7000,
            variants: [{ name: "Gelas", price: 7000 }],
            lastUpdated: "2024-01-15",
            updatedBy: "Admin",
        },
    ]);

    // Dummy categories
    const categories = [
        {
            id: 1,
            name: "Makanan",
            count: 10,
            description: "Produk makanan siap saji",
        },
        {
            id: 2,
            name: "Minuman",
            count: 8,
            description: "Berbagai jenis minuman",
        },
    ];

    // Dummy ingredients (dari stock)
    const availableIngredients = [
        { id: 1, name: "Nasi Putih" },
        { id: 2, name: "Mie Instan" },
        { id: 3, name: "Telur" },
        { id: 4, name: "Kecap" },
        { id: 5, name: "Teh" },
        { id: 6, name: "Gula" },
    ];

    const handleAddProduct = (newProduct) => {
        const product = {
            ...newProduct,
            id: productData.length + 1,
            lastUpdated: new Date().toISOString().split("T")[0],
            updatedBy: "Admin",
        };
        setProductData([...productData, product]);
        setShowFormModal(false);
    };

    const handleUpdateProduct = (updatedProduct) => {
        setProductData(
            productData.map((item) =>
                item.id === updatedProduct.id
                    ? {
                          ...updatedProduct,
                          lastUpdated: new Date().toISOString().split("T")[0],
                          updatedBy: "Admin",
                      }
                    : item
            )
        );
        setEditingProduct(null);
        setShowFormModal(false);
    };

    const handleDeleteProduct = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            setProductData(productData.filter((item) => item.id !== id));
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    const handleViewHistory = (product) => {
        setSelectedProductHistory(product);
        setShowHistoryModal(true);
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
                    />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Product Table */}
                        <ProductTable
                            data={productData}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onViewHistory={handleViewHistory}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFormModal && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories}
                    ingredients={availableIngredients}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingProduct(null);
                    }}
                    onSubmit={
                        editingProduct ? handleUpdateProduct : handleAddProduct
                    }
                />
            )}

            {showHistoryModal && selectedProductHistory && (
                <ProductHistoryModal
                    product={selectedProductHistory}
                    onClose={() => {
                        setShowHistoryModal(false);
                        setSelectedProductHistory(null);
                    }}
                />
            )}
        </>
    );
}

export default ProductManagement;
