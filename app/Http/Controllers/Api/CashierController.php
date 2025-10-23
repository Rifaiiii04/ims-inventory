<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CashierController extends Controller
{
    /**
     * Get all cashiers
     */
    public function index(Request $request)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat mengelola kasir.'
                ], 403);
            }

            $cashiers = DB::table('tbl_user')
                ->where('level', 'kasir')
                ->orderBy('nama_user', 'asc')
                ->get();

            $formattedCashiers = $cashiers->map(function($cashier) {
                return [
                    'id' => $cashier->id_user,
                    'username' => $cashier->username,
                    'nama_user' => $cashier->nama_user,
                    'email' => $cashier->email ?? '',
                    'level' => $cashier->level,
                    'status' => $cashier->status ?? 'aktif',
                    'created_at' => $cashier->created_at,
                    'updated_at' => $cashier->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedCashiers
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cashier by ID
     */
    public function show(Request $request, $id)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat melihat detail kasir.'
                ], 403);
            }

            $cashier = DB::table('tbl_user')
                ->where('id_user', $id)
                ->where('level', 'kasir')
                ->first();

            if (!$cashier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kasir tidak ditemukan'
                ], 404);
            }

            $formattedCashier = [
                'id' => $cashier->id_user,
                'username' => $cashier->username,
                'nama_user' => $cashier->nama_user,
                'email' => $cashier->email,
                'level' => $cashier->level,
                'status' => $cashier->status ?? 'aktif',
                'created_at' => $cashier->created_at,
                'updated_at' => $cashier->updated_at,
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedCashier
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new cashier
     */
    public function store(Request $request)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat membuat kasir.'
                ], 403);
            }
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:50|unique:tbl_user,username',
                'nama_user' => 'required|string|max:100',
                'email' => 'nullable|email|max:100',
                'password' => 'required|string|min:6',
                'status' => 'nullable|string|in:aktif,nonaktif'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cashierId = DB::table('tbl_user')->insertGetId([
                'username' => $request->username,
                'nama_user' => $request->nama_user,
                'email' => $request->email ?? '',
                'password' => Hash::make($request->password),
                'level' => 'kasir',
                'status' => $request->status ?? 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kasir berhasil ditambahkan',
                'data' => [
                    'id' => $cashierId,
                    'username' => $request->username,
                    'nama_user' => $request->nama_user,
                    'email' => $request->email ?? '',
                    'level' => 'kasir',
                    'status' => $request->status ?? 'aktif',
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cashier
     */
    public function update(Request $request, $id)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat mengupdate kasir.'
                ], 403);
            }

            $cashier = DB::table('tbl_user')
                ->where('id_user', $id)
                ->where('level', 'kasir')
                ->first();

            if (!$cashier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kasir tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:50|unique:tbl_user,username,' . $id . ',id_user',
                'nama_user' => 'required|string|max:100',
                'email' => 'nullable|email|max:100',
                'password' => 'nullable|string|min:6',
                'status' => 'nullable|string|in:aktif,nonaktif'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'username' => $request->username,
                'nama_user' => $request->nama_user,
                'email' => $request->email ?? $cashier->email,
                'status' => $request->status ?? $cashier->status,
                'updated_at' => now(),
            ];

            // Update password if provided
            if ($request->password) {
                $updateData['password'] = Hash::make($request->password);
            }

            DB::table('tbl_user')
                ->where('id_user', $id)
                ->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Kasir berhasil diperbarui',
                'data' => [
                    'id' => $id,
                    'username' => $request->username,
                    'nama_user' => $request->nama_user,
                    'email' => $request->email ?? $cashier->email,
                    'level' => 'kasir',
                    'status' => $request->status ?? $cashier->status,
                    'created_at' => $cashier->created_at,
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete cashier
     */
    public function destroy(Request $request, $id)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat menghapus kasir.'
                ], 403);
            }

            $cashier = DB::table('tbl_user')
                ->where('id_user', $id)
                ->where('level', 'kasir')
                ->first();

            if (!$cashier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kasir tidak ditemukan'
                ], 404);
            }

            DB::table('tbl_user')->where('id_user', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kasir berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset cashier password
     */
    public function resetPassword(Request $request, $id)
    {
        try {
            // Check if user is admin
            $user = $request->user();
            if (!$user || $user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya admin yang dapat reset password kasir.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'new_password' => 'required|string|min:6|confirmed',
                'new_password_confirmation' => 'required|string|min:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cashier = DB::table('tbl_user')
                ->where('id_user', $id)
                ->where('level', 'kasir')
                ->first();

            if (!$cashier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kasir tidak ditemukan'
                ], 404);
            }

            // Update password
            DB::table('tbl_user')
                ->where('id_user', $id)
                ->update([
                    'password' => Hash::make($request->new_password),
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Password kasir berhasil direset'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cashier statistics
     */
    public function statistics()
    {
        try {
            $totalCashiers = DB::table('tbl_user')
                ->where('level', 'kasir')
                ->count();

            $activeCashiers = DB::table('tbl_user')
                ->where('level', 'kasir')
                ->where('status', 'aktif')
                ->count();

            $inactiveCashiers = DB::table('tbl_user')
                ->where('level', 'kasir')
                ->where('status', 'nonaktif')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_cashiers' => $totalCashiers,
                    'active_cashiers' => $activeCashiers,
                    'inactive_cashiers' => $inactiveCashiers,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik kasir',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}