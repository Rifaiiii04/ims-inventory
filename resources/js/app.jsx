import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import StockManagement from "./pages/StockManagement";
import ProductManagement from "./pages/ProductManagement";
import CategoryManagement from "./pages/CategoryManagement";
import VariantManagement from "./pages/VariantManagement";
import CompositionManagement from "./pages/CompositionManagement";
import SalesReport from "./pages/SalesReport";
import Transaction from "./pages/pos/Transaction";
import TransactionHistory from "./pages/pos/TransactionHistory";
import PosSalesReport from "./pages/pos/SalesReport";
import InventoryReport from "./pages/InventoryReport";
import NotificationManagement from "./pages/NotificationManagement";
import AccountManagement from "./pages/AccountManagement";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/products/stock" 
                        element={
                            <ProtectedRoute>
                                <StockManagement />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/products" 
                        element={
                            <ProtectedRoute>
                                <ProductManagement />
                            </ProtectedRoute>
                        } 
                    />
                    <Route
                        path="/products/categories"
                        element={
                            <ProtectedRoute>
                                <CategoryManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/products/variants"
                        element={
                            <ProtectedRoute>
                                <VariantManagement />
                            </ProtectedRoute>
                        }
                    />
                        <Route
                            path="/products/compositions"
                            element={
                                <ProtectedRoute>
                                    <CompositionManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route 
                            path="/reports/sales"
                        element={
                            <ProtectedRoute>
                                <SalesReport />
                            </ProtectedRoute>
                        } 
                        />
                        <Route
                            path="/pos/transaction"
                            element={
                                <ProtectedRoute>
                                    <Transaction />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/pos/history"
                            element={
                                <ProtectedRoute>
                                    <TransactionHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/pos/sales-report"
                            element={
                                <ProtectedRoute>
                                    <PosSalesReport />
                                </ProtectedRoute>
                            }
                        />
                    <Route
                        path="/reports/inventory"
                        element={
                            <ProtectedRoute>
                                <InventoryReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/accounts" 
                        element={
                            <ProtectedRoute>
                                <AccountManagement />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

const root = createRoot(document.getElementById("app"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
