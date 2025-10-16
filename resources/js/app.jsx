import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import StockManagement from "./pages/StockManagement";
import ProductManagement from "./pages/ProductManagement";
import CategoryManagement from "./pages/CategoryManagement";
import VariantManagement from "./pages/VariantManagement";
import SalesReport from "./pages/SalesReport";
import InventoryReport from "./pages/InventoryReport";
import NotificationManagement from "./pages/NotificationManagement";
import AccountManagement from "./pages/AccountManagement";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products/stock" element={<StockManagement />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route
                    path="/products/categories"
                    element={<CategoryManagement />}
                />
                <Route
                    path="/products/variants"
                    element={<VariantManagement />}
                />
                <Route path="/reports/sales" element={<SalesReport />} />
                <Route
                    path="/reports/inventory"
                    element={<InventoryReport />}
                />
                <Route
                    path="/notifications"
                    element={<NotificationManagement />}
                />
                <Route path="/accounts" element={<AccountManagement />} />
            </Routes>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById("app"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
