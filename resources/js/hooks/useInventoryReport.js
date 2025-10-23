import { useState, useEffect } from "react";
import axios from "axios";

export const useInventoryReport = () => {
    const [reportData, setReportData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInventoryReport = async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.product) params.append("product", filters.product);
            if (filters.category) params.append("category", filters.category);
            if (filters.date) params.append("date", filters.date);

            console.log("Fetching inventory report...");
            const response = await axios.get(
                `/api/reports/inventory?${params.toString()}`
            );
            console.log("Inventory report response:", response.data);

            if (response.data.success) {
                setReportData(response.data.data);
                console.log("Report data set:", response.data.data);
            } else {
                setError(
                    response.data.message || "Gagal mengambil data laporan"
                );
            }
        } catch (err) {
            console.error("Error fetching inventory report:", err);
            console.error("Error details:", err.response?.data);
            setError(
                err.response?.data?.message ||
                    "Terjadi kesalahan saat mengambil data laporan"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/reports/categories");
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const exportExcel = async (filters = {}) => {
        try {
            const response = await axios.post(
                "/api/reports/inventory/export/excel",
                filters,
                {
                    responseType: "blob",
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `inventory-report-${
                    new Date().toISOString().split("T")[0]
                }.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (err) {
            console.error("Error exporting Excel:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Gagal export Excel",
            };
        }
    };

    const exportPDF = async (filters = {}) => {
        try {
            const response = await axios.post(
                "/api/reports/inventory/export/pdf",
                filters,
                {
                    responseType: "blob",
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `inventory-report-${new Date().toISOString().split("T")[0]}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (err) {
            console.error("Error exporting PDF:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Gagal export PDF",
            };
        }
    };

    useEffect(() => {
        console.log("useInventoryReport: useEffect triggered");
        fetchInventoryReport();
        fetchCategories();
    }, []);

    return {
        reportData,
        categories,
        loading,
        error,
        fetchInventoryReport,
        exportExcel,
        exportPDF,
        refreshData: () => fetchInventoryReport(),
    };
};
