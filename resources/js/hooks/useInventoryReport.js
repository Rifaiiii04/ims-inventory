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

    const exportPDF = async (filters = {}) => {
        try {
            const response = await axios.post(
                "/api/reports/inventory/export/pdf",
                filters,
                {
                    responseType: "text",
                    headers: {
                        'Accept': 'text/html'
                    }
                }
            );

            // Open HTML in new window for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(response.data);
            printWindow.document.close();
            
            // Wait for content to load then trigger print
            printWindow.onload = () => {
                printWindow.print();
            };

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

        // Auto-refresh every 30 seconds for real-time data
        const refreshInterval = setInterval(() => {
            console.log("Auto-refreshing inventory report...");
            fetchInventoryReport();
        }, 30000); // Refresh every 30 seconds

        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    return {
        reportData,
        categories,
        loading,
        error,
        fetchInventoryReport,
        exportPDF,
        refreshData: () => fetchInventoryReport(),
    };
};
