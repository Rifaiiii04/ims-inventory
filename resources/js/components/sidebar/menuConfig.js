// Menu Configuration
// Ini adalah single source of truth untuk semua menu items

export const menuConfig = [
    {
        id: "dashboard",
        type: "single",
        label: "Dashboard",
        path: "/dashboard",
        icon: "DashboardIcon",
    },
    {
        id: "products",
        type: "submenu",
        label: "Manajemen Product",
        icon: "ProductIcon",
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
        ],
    },
    {
        id: "reports",
        type: "submenu",
        label: "Laporan",
        icon: "ReportIcon",
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
    },
    {
        id: "accounts",
        type: "single",
        label: "Manajemen Akun",
        path: "/accounts",
        icon: "UserIcon",
    },
];
