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
        async (filters = {}) => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (filters.product) params.append("product", filters.product);
                if (filters.category)
                    params.append("category", filters.category);
                if (filters.date) params.append("date", filters.date);
                if (filters.payment) params.append("payment", filters.payment);
                if (filters.period) params.append("period", filters.period);

                console.log("Fetching sales report...");
                const response = await axios.get(
                    `/api/reports/sales?${params.toString()}`
                );
                console.log("Sales report response:", response.data);

                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setError(
                        response.data.message ||
                            "Gagal mengambil data laporan penjualan"
                    );
                }
            } catch (err) {
                console.error("Error fetching sales report:", err);
                setError(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat mengambil data laporan penjualan"
                );
            } finally {
                setLoading(false);
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

    const exportExcel = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.product) params.append("product", filters.product);
            if (filters.category) params.append("category", filters.category);
            if (filters.date) params.append("date", filters.date);
            if (filters.payment) params.append("payment", filters.payment);
            if (filters.period) params.append("period", filters.period);

            const response = await axios.get(
                `/api/reports/sales/export/excel?${params.toString()}`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `laporan_penjualan_${
                    new Date().toISOString().split("T")[0]
                }.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            return { success: true, message: "Laporan berhasil diekspor" };
        } catch (err) {
            console.error("Error exporting Excel:", err);
            return {
                success: false,
                message:
                    err.response?.data?.message || "Gagal mengekspor laporan",
            };
        }
    };

    const exportPDF = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.product) params.append("product", filters.product);
            if (filters.category) params.append("category", filters.category);
            if (filters.date) params.append("date", filters.date);
            if (filters.payment) params.append("payment", filters.payment);
            if (filters.period) params.append("period", filters.period);

            const response = await axios.get(
                `/api/reports/sales/export/pdf?${params.toString()}`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `laporan_penjualan_${
                    new Date().toISOString().split("T")[0]
                }.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

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

    return {
        reportData,
        products,
        categories,
        loading,
        error,
        fetchSalesReport,
        exportExcel,
        exportPDF,
        refreshData: () => {
            fetchSalesReport();
            fetchProducts();
            fetchCategories();
        },
    };
};
