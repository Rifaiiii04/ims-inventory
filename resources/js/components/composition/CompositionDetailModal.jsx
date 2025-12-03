import React, { useState } from "react";
import axios from "axios";

function CompositionDetailModal({ composition, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedMainIngredient, setSelectedMainIngredient] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    if (!composition) return null;
    
    // Set selected main ingredient saat modal dibuka
    React.useEffect(() => {
        if (composition?.ingredients) {
            const mainIngredient = composition.ingredients.find(
                ing => ing.is_bahan_baku_utama === true || ing.is_bahan_baku_utama === 1
            );
            if (mainIngredient) {
                setSelectedMainIngredient(mainIngredient.composition_id);
            }
        }
    }, [composition]);
    
    const handleSetMainIngredient = async (compositionId) => {
        if (!isEditing) {
            setIsEditing(true);
        }
        setSelectedMainIngredient(compositionId);
    };
    
    const handleSaveMainIngredient = async () => {
        if (!selectedMainIngredient) {
            alert("Pilih salah satu bahan sebagai Bahan Baku Utama");
            return;
        }
        
        setIsSaving(true);
        try {
            // Update semua komposisi untuk variant/produk ini
            const updatePromises = composition.ingredients.map(async (ingredient) => {
                const isMain = ingredient.composition_id === selectedMainIngredient;
                
                // Siapkan data update
                const updateData = {
                    ingredient_id: ingredient.ingredient_id,
                    quantity: ingredient.quantity,
                    is_bahan_baku_utama: isMain
                };
                
                // Tambahkan variant_id jika ada, atau product_id jika tidak ada variant
                if (composition.variant_id) {
                    updateData.variant_id = composition.variant_id;
                } else {
                    updateData.product_id = composition.product_id;
                }
                
                // Update komposisi
                const response = await axios.put(`/api/compositions/${ingredient.composition_id}`, updateData);
                
                return response.data;
            });
            
            await Promise.all(updatePromises);
            
            // Refresh data
            if (onUpdate) {
                await onUpdate();
            }
            
            setIsEditing(false);
            alert("Bahan baku utama berhasil diperbarui!");
        } catch (error) {
            console.error("Error updating main ingredient:", error);
            alert("Terjadi kesalahan saat memperbarui bahan baku utama: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

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
                                {composition.product_name}
                                {composition.variant_name && ` - ${composition.variant_name}`}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    {composition.variant_name || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Stok Varian (Siap)
                                </label>
                                <p className={`text-lg font-semibold ${
                                    (composition.stok_varian || 0) > 0 ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {composition.stok_varian || 0} porsi
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Estimasi Produksi Total
                                </label>
                                <p className={`text-lg font-semibold ${
                                    composition.estimated_production > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {composition.estimated_production > 0 
                                        ? `${composition.estimated_production} porsi` 
                                        : '0 porsi (stok habis)'}
                                </p>
                                {composition.estimated_production > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(composition.stok_varian || 0) > 0 && `${composition.stok_varian} siap`}
                                        {(composition.stok_varian || 0) > 0 && composition.estimated_production > (composition.stok_varian || 0) && ' + '}
                                        {composition.estimated_production > (composition.stok_varian || 0) && `${composition.estimated_production - (composition.stok_varian || 0)} bisa dibuat`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Daftar Bahan */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Bahan Baku ({composition.ingredients?.length || 0} bahan)
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Pilih Bahan Baku Utama
                                </button>
                            )}
                        </div>
                        
                        {isEditing && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>💡 Pilih Bahan Baku Utama:</strong> Klik radio button pada salah satu bahan untuk menjadikannya bahan baku utama. Ketersediaan produk di transaksi akan bergantung pada stok bahan baku utama ini.
                                </p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {/* Tampilkan semua bahan dari array ingredients */}
                            {composition.ingredients && composition.ingredients.length > 0 ? (
                                composition.ingredients.map((ingredient, index) => {
                                    // Hitung estimasi produksi untuk bahan ini
                                    // Pastikan stok bahan > 0 dan quantity > 0
                                    const ingredientEstimation = (ingredient.quantity > 0 && ingredient.ingredient_stock > 0)
                                        ? Math.floor(ingredient.ingredient_stock / ingredient.quantity)
                                        : 0;
                                    
                                    // Hitung status stok
                                    const isLowStock = ingredient.min_stok && ingredient.ingredient_stock < ingredient.min_stok;
                                    const stockStatus = ingredient.ingredient_stock <= 0 
                                        ? 'habis' 
                                        : isLowStock 
                                        ? 'menipis' 
                                        : 'cukup';
                                    
                                    const isMainIngredient = ingredient.is_bahan_baku_utama === true || ingredient.is_bahan_baku_utama === 1;
                                    const isSelected = selectedMainIngredient === ingredient.composition_id;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all ${
                                                isEditing && isSelected 
                                                    ? 'border-green-400 bg-green-50' 
                                                    : isMainIngredient && !isEditing
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-200'
                                            } ${isEditing ? 'cursor-pointer' : ''}`}
                                            onClick={(e) => {
                                                if (isEditing) {
                                                    // Jika klik di area card, pilih bahan ini
                                                    const target = e.target;
                                                    // Jangan trigger jika klik di radio button atau label
                                                    if (target.type !== 'radio' && target.tagName !== 'LABEL') {
                                                        handleSetMainIngredient(ingredient.composition_id);
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    {isEditing && (
                                                        <div className="pt-1 flex-shrink-0">
                                                            <label 
                                                                className="cursor-pointer flex items-center"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetMainIngredient(ingredient.composition_id);
                                                                }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="main_ingredient"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSetMainIngredient(ingredient.composition_id);
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                        stockStatus === 'habis' ? 'bg-red-100' :
                                                        stockStatus === 'menipis' ? 'bg-yellow-100' :
                                                        'bg-green-100'
                                                    }`}>
                                                        <span className={`font-semibold text-sm ${
                                                            stockStatus === 'habis' ? 'text-red-600' :
                                                            stockStatus === 'menipis' ? 'text-yellow-600' :
                                                            'text-green-600'
                                                        }`}>
                                                            {ingredient.ingredient_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {ingredient.ingredient_name}
                                                            </h4>
                                                            {(isMainIngredient || isSelected) && (
                                                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                                                                    Bahan Baku Utama
                                                                </span>
                                                            )}
                                                            {ingredient.kategori && (
                                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                                    {ingredient.kategori}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-500 text-xs mb-1">Jumlah per porsi</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {ingredient.quantity} {ingredient.ingredient_unit}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 text-xs mb-1">Stok tersedia</p>
                                                                <p className={`font-medium ${
                                                                    stockStatus === 'habis' ? 'text-red-600' :
                                                                    stockStatus === 'menipis' ? 'text-yellow-600' :
                                                                    'text-gray-900'
                                                                }`}>
                                                                    {ingredient.ingredient_stock} {ingredient.ingredient_unit}
                                                                </p>
                                                            </div>
                                                            {ingredient.min_stok > 0 && (
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Stok minimum</p>
                                                                    <p className="font-medium text-gray-700">
                                                                        {ingredient.min_stok} {ingredient.ingredient_unit}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {ingredient.harga_beli > 0 && (
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Harga beli</p>
                                                                    <p className="font-medium text-gray-700">
                                                                        Rp {new Intl.NumberFormat('id-ID').format(ingredient.harga_beli)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-gray-500 text-xs mb-1">Estimasi produksi</p>
                                                                <p className={`font-semibold ${
                                                                    ingredientEstimation > 0 ? "text-green-600" : "text-red-600"
                                                                }`}>
                                                                    {ingredientEstimation} porsi
                                                                </p>
                                                            </div>
                                                            {ingredient.is_divisible && (
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Dapat dibagi</p>
                                                                    <p className="font-medium text-gray-700">
                                                                        {ingredient.max_divisions ? `Max ${ingredient.max_divisions} bagian` : 'Ya'}
                                                                    </p>
                                                                    {ingredient.division_description && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {ingredient.division_description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {stockStatus === 'menipis' && (
                                                            <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                Stok menipis! Perlu restock
                                                            </p>
                                                        )}
                                                        {stockStatus === 'habis' && (
                                                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                </svg>
                                                                Stok habis! Tidak bisa diproduksi
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Tidak ada bahan yang terdaftar
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end gap-3">
                        {isEditing && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset selection
                                        const mainIngredient = composition.ingredients.find(
                                            ing => ing.is_bahan_baku_utama === true || ing.is_bahan_baku_utama === 1
                                        );
                                        setSelectedMainIngredient(mainIngredient?.composition_id || null);
                                    }}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-medium"
                                    disabled={isSaving}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveMainIngredient}
                                    disabled={isSaving || !selectedMainIngredient}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        {!isEditing && (
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                            >
                                Tutup
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompositionDetailModal;
