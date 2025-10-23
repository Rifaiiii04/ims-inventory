import React from "react";

function CompositionTable({ data, onEdit, onDelete }) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada komposisi</h3>
                    <p className="text-gray-500 text-sm">Mulai dengan menambahkan komposisi pertama</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Varian
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Produk
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Bahan
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Jumlah
                            </th>
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((composition) => (
                            <tr key={composition.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                            <span className="text-white font-bold text-sm sm:text-base">
                                                {composition.variant_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                {composition.variant_name}
                                            </p>
                                            <p className="text-xs text-gray-500">ID: {composition.variant_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {composition.product_name}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                                            <span className="text-white font-bold text-xs">
                                                {composition.ingredient_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                {composition.ingredient_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{composition.ingredient_unit}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center">
                                        <span className="text-sm sm:text-base font-semibold text-gray-900">
                                            {composition.quantity}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            {composition.ingredient_unit}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(composition)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit komposisi"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(composition.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus komposisi"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CompositionTable;
