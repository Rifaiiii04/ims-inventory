// Menu Configuration
// Ini adalah single source of truth untuk semua menu items

// Helper function untuk filter menu berdasarkan level user
export const getFilteredMenu = (userLevel) => {
    const allMenus = [
        {
            id: "dashboard",
            type: "single",
            label: "Dashboard",
            path: "/dashboard",
            icon: "DashboardIcon",
            access: ["admin", "kasir"], // Bisa diakses admin dan kasir
        },
        {
            id: "products",
            type: "submenu",
            label: "Manajemen Product",
            icon: "ProductIcon",
            access: ["admin"], // Hanya admin
            submenu: [
                {
                    id: "stock",
                    label: "Pengelolaan Stok",
                    path: "/products/stock",
                    icon: "StockIcon",
                },
                {
                    id: "product-list",
                    label: "Products",
                    path: "/products",
                    icon: "ShoppingBagIcon",
                },
                {
                    id: "categories",
                    label: "Kategori",
                    path: "/products/categories",
                    icon: "StockIcon",
                },
                {
                    id: "variants",
                    label: "Varian",
                    path: "/products/variants",
                    icon: "ShoppingBagIcon",
                },
                {
                    id: "compositions",
                    label: "Komposisi",
                    path: "/products/compositions",
                    icon: "StockIcon",
                },
            ],
        },
        {
            id: "pos",
            type: "submenu",
            label: "Kasir (POS)",
            icon: "ShoppingCartIcon",
            access: ["kasir"], // Hanya kasir
            submenu: [
                {
                    id: "transaction",
                    label: "Transaksi",
                    path: "/pos/transaction",
                    icon: "CreditCardIcon",
                },
                {
                    id: "transaction-history",
                    label: "Riwayat Transaksi",
                    path: "/pos/history",
                    icon: "ClockIcon",
                },
                {
                    id: "sales-report",
                    label: "Laporan Penjualan",
                    path: "/pos/sales-report",
                    icon: "ChartBarIcon",
                },
            ],
        },
        {
            id: "reports",
            type: "submenu",
            label: "Laporan",
            icon: "ReportIcon",
            access: ["admin"], // Hanya admin
            submenu: [
                {
                    id: "sales-report",
                    label: "Laporan Penjualan",
                    path: "/reports/sales",
                    icon: "ReportIcon",
                },
                {
                    id: "inventory-report",
                    label: "Laporan Inventory",
                    path: "/reports/inventory",
                    icon: "StockIcon",
                },
            ],
        },
        {
            id: "notifications",
            type: "single",
            label: "Kelola Notifikasi",
            path: "/notifications",
            icon: "BellIcon",
            access: ["admin"], // Hanya admin
        },
        {
            id: "accounts",
            type: "single",
            label: "Manajemen Akun",
            path: "/accounts",
            icon: "UserIcon",
            access: ["admin"], // Hanya admin yang bisa akses
        },
    ];

    // Filter menu berdasarkan level user
    return allMenus.filter((menu) => {
        if (!menu.access) return true; // Jika tidak ada access, tampilkan untuk semua
        return menu.access.includes(userLevel);
    });
};

// Export menu default untuk backward compatibility
export const menuConfig = getFilteredMenu("admin");
