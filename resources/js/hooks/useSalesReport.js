import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export const useSalesReport = () => {
    const { isAuthenticated } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSalesReport = useCallback(
        async (filters = {}, silent = false) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                // Only show loading if not silent refresh
                if (!silent) {
                    setLoading(true);
                    setError(null);
                }

                const params = new URLSearchParams();
                if (filters.product) params.append("product", filters.product);
                if (filters.category)
                    params.append("category", filters.category);
                if (filters.date) params.append("date", filters.date);
                if (filters.payment) params.append("payment", filters.payment);
                if (filters.period) params.append("period", filters.period);

                const response = await axios.get(
                    `/api/reports/sales?${params.toString()}`
                );

                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    // Only set error if not silent refresh
                    if (!silent) {
                        setError(
                            response.data.message ||
                                "Gagal mengambil data laporan penjualan"
                        );
                    }
                }
            } catch (err) {
                // Only set error if not silent refresh
                if (!silent) {
                    console.error("Error fetching sales report:", err);
                    setError(
                        err.response?.data?.message ||
                            "Terjadi kesalahan saat mengambil data laporan penjualan"
                    );
                }
            } finally {
                // Only update loading if not silent refresh
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [isAuthenticated]
    );

    const fetchProducts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get("/api/products");
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }, [isAuthenticated]);

    const fetchCategories = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get("/api/products/categories/list");
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, [isAuthenticated]);

    const exportPDF = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.product) params.append("product", filters.product);
            if (filters.category) params.append("category", filters.category);
            if (filters.date) params.append("date", filters.date);
            if (filters.payment) params.append("payment", filters.payment);
            if (filters.period) params.append("period", filters.period);

            // Get HTML response and open in new window for printing
            const response = await axios.get(
                `/api/reports/sales/export/pdf?${params.toString()}`,
                {
                    responseType: "text",
                }
            );

            // Open HTML in new window for printing
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(response.data);
                printWindow.document.close();
                // Auto trigger print dialog
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            } else {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }

            return { success: true, message: "Laporan berhasil diekspor" };
        } catch (err) {
            console.error("Error exporting PDF:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message || "Gagal mengekspor laporan",
            };
        }
    };

    useEffect(() => {
        fetchSalesReport();
        fetchProducts();
        fetchCategories();
    }, [fetchSalesReport, fetchProducts, fetchCategories]);

    // Note: Auto-refresh is handled at component level to use current filters

    return {
        reportData,
        products,
        categories,
        loading,
        error,
        fetchSalesReport,
        exportPDF,
        refreshData: () => {
            fetchSalesReport();
            fetchProducts();
            fetchCategories();
        },
    };
};
