import React from "react";

function CompositionDetailModal({ composition, onClose }) {
    if (!composition) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">
                                Detail Komposisi
                            </h2>
                            <p className="text-green-50 text-sm">
                                {composition.product_name} -{" "}
                                {composition.variant_name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Info Varian */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Produk
                                </label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {composition.product_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Varian
                                </label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {composition.variant_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Estimasi Produksi
                                </label>
                                <p className="text-lg font-semibold text-green-600">
                                    {composition.estimated_production} porsi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Daftar Bahan */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Bahan Baku ({composition.ingredients_count} bahan)
                        </h3>
                        <div className="space-y-3">
                            {composition.ingredients.map(
                                (ingredient, index) => (
                                    <div
                                        key={index}
                                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-green-600 font-semibold text-sm">
                                                        {ingredient.ingredient_name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {
                                                            ingredient.ingredient_name
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {ingredient.quantity}{" "}
                                                        {
                                                            ingredient.ingredient_unit
                                                        }{" "}
                                                        per porsi
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">
                                                            Stok Tersedia
                                                        </p>
                                                        <p className="font-semibold text-gray-900">
                                                            {
                                                                ingredient.ingredient_stock
                                                            }{" "}
                                                            {
                                                                ingredient.ingredient_unit
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-500">
                                                            Estimasi
                                                        </p>
                                                        <p
                                                            className={`font-semibold ${
                                                                ingredient.estimated_production >
                                                                0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {
                                                                ingredient.estimated_production
                                                            }{" "}
                                                            porsi
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar untuk Stok */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Ketersediaan Stok</span>
                                                <span>
                                                    {ingredient.ingredient_stock >
                                                    0
                                                        ? `${Math.round(
                                                              (ingredient.ingredient_stock /
                                                                  (ingredient.ingredient_stock +
                                                                      10)) *
                                                                  100
                                                          )}%`
                                                        : "0%"}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        ingredient.estimated_production >
                                                        5
                                                            ? "bg-green-500"
                                                            : ingredient.estimated_production >
                                                              0
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                    }`}
                                                    style={{
                                                        width:
                                                            ingredient.ingredient_stock >
                                                            0
                                                                ? `${Math.min(
                                                                      (ingredient.ingredient_stock /
                                                                          (ingredient.ingredient_stock +
                                                                              10)) *
                                                                          100,
                                                                      100
                                                                  )}%`
                                                                : "0%",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompositionDetailModal;
