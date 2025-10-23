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
    public function show($id)
    {
        try {
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
            // Simple validation
            if (!$request->username || !$request->nama_user || !$request->password) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username, nama, dan password harus diisi'
                ], 422);
            }

            // Check if username already exists
            $existingUser = DB::table('tbl_user')
                ->where('username', $request->username)
                ->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username sudah digunakan'
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

            // Simple validation
            if (!$request->username || !$request->nama_user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username dan nama harus diisi'
                ], 422);
            }

            // Check if username already exists (excluding current user)
            $existingUser = DB::table('tbl_user')
                ->where('username', $request->username)
                ->where('id_user', '!=', $id)
                ->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username sudah digunakan'
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
    public function destroy($id)
    {
        try {
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