# -*- coding: utf-8 -*-
import json
import os
import sys
import logging
import requests
import re
from typing import Dict, Optional, List
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pathlib

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

env_path = pathlib.Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("expired_prediction_service")

OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:1b')

app = Flask(__name__)

# Global error handler untuk menangkap semua unhandled exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all unhandled exceptions and return proper JSON response"""
    error_msg = f"Unhandled exception: {str(e)}"
    logger.error(error_msg, exc_info=True)
    print(f"[GLOBAL ERROR HANDLER] {error_msg}")
    import traceback
    traceback.print_exc()
    return jsonify({
        'success': False,
        'message': 'Terjadi kesalahan pada server',
        'error': str(e)
    }), 500


def get_ollama_config():
    return {
        'url': OLLAMA_URL,
        'model': OLLAMA_MODEL
    }

def is_ollama_available():
    try:
        config = get_ollama_config()
        base_url = config['url'].rsplit('/', 1)[0]
        tags_url = base_url + '/tags'
        resp = requests.get(tags_url, timeout=3)
        return resp.status_code == 200
    except Exception as e:
        logger.warning("Ollama check failed: %s", e)
        return False

def call_ollama_api(prompt: str, timeout: int = 240, retry: int = 2) -> Optional[str]:
    for attempt in range(retry + 1):
        try:
            config = get_ollama_config()
            print(f"\n{'='*80}")
            print(f"[OLLAMA API] Memanggil Ollama API (Attempt {attempt + 1}/{retry + 1})...")
            print(f"[OLLAMA API] Model: {config['model']}")
            print(f"[OLLAMA API] Timeout: {timeout}s")
            print(f"{'='*80}")
            
            start_time = datetime.now()

            response = requests.post(
                config['url'],
                json={
                    'model': config['model'],
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'num_predict': 3000,  # Increased untuk prompt yang lebih panjang
                        'temperature': 0.3,  # Lower temperature untuk lebih konsisten dan akurat
                        'top_p': 0.85,  # Slightly lower untuk lebih fokus
                        'top_k': 40,  # Lower untuk lebih deterministik
                        'repeat_penalty': 1.2  # Slightly lower untuk menghindari pengulangan berlebihan
                    }
                },
                timeout=timeout
            )

            elapsed = (datetime.now() - start_time).total_seconds()
            print(f"[OLLAMA API] Response diterima dalam {elapsed:.2f} detik")

            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()
                print(f"[OLLAMA API] Response length: {len(response_text)} karakter")
                if len(response_text) > 50:
                    print(f"[OLLAMA API] Response preview: {response_text[:100]}...")
                return response_text
            else:
                error_text = response.text
                print(f"[OLLAMA API] ERROR: Status {response.status_code}")
                print(f"[OLLAMA API] Error text: {error_text[:200]}...")
                logger.error("Ollama API error %s: %s", response.status_code, error_text)
                if attempt < retry:
                    print(f"[OLLAMA API] Retrying...")
                    continue
                return None
        except requests.exceptions.Timeout:
            print(f"[OLLAMA API] TIMEOUT setelah {timeout}s")
            if attempt < retry:
                print(f"[OLLAMA API] Retrying...")
                continue
            logger.warning("Ollama API timeout after %ss", timeout)
            return None
        except requests.exceptions.ConnectionError:
            print(f"[OLLAMA API] CONNECTION ERROR")
            if attempt < retry:
                print(f"[OLLAMA API] Retrying...")
                continue
            logger.error("Ollama connection error")
            return None
        except Exception as e:
            print(f"[OLLAMA API] EXCEPTION: {str(e)}")
            if attempt < retry:
                print(f"[OLLAMA API] Retrying...")
                continue
            logger.error("Ollama API call error: %s", e)
            return None
    
    return None


def build_expiration_prompt(bahan_data: Dict, is_retry: bool = False, previous_error: str = '') -> str:
    try:
        nama_bahan = bahan_data.get('nama_bahan', '')
        kategori = bahan_data.get('kategori', '')
        stok = bahan_data.get('stok_bahan', '')
        satuan = bahan_data.get('satuan', '')
        harga_beli = bahan_data.get('harga_beli', 0)
        min_stok = bahan_data.get('min_stok', '')
        
        # Tanggal dibuat dan terakhir update
        tanggal_dibuat_str = bahan_data.get('tanggal_dibuat', '')
        terakhir_update_str = bahan_data.get('terakhir_update', '')
        
        if not terakhir_update_str:
            terakhir_update = datetime.now()
            terakhir_update_str = terakhir_update.strftime('%Y-%m-%d')
        
        # Hitung umur stok dan hari sejak update
        umur_stok_hari = bahan_data.get('umur_stok_hari')
        hari_sejak_update = bahan_data.get('hari_sejak_update')
        
        today = datetime.now()
        today_str = today.strftime('%Y-%m-%d')
        
        retry_note = ""
        if is_retry:
            if 'JSON' in previous_error.upper() or 'parse' in previous_error.lower():
                retry_note = f"\n⚠️ KESALAHAN SEBELUMNYA: {previous_error}\n⚠️ PENTING: Kembalikan HANYA JSON tanpa teks penjelasan!\n"
            else:
                retry_note = f"\n⚠️ KESALAHAN SEBELUMNYA: {previous_error}\n"
        
        return f"""Anda adalah ahli prediksi masa simpan bahan makanan. Analisis dan prediksi kapan {nama_bahan} akan expired.

DATA BAHAN:
- Nama: {nama_bahan}
- Kategori: {kategori}
- Stok: {stok} {satuan}
- Tanggal dibuat: {tanggal_dibuat_str if tanggal_dibuat_str else 'Tidak diketahui'}
- Terakhir update: {terakhir_update_str}
- Umur stok: {umur_stok_hari if umur_stok_hari is not None else 'Tidak diketahui'} hari
- Hari sejak update: {hari_sejak_update if hari_sejak_update is not None else 'Tidak diketahui'} hari

PENTING - BACA INI DENGAN HATI-HATI:

1. ANALISIS KARAKTERISTIK {nama_bahan.upper()}:
   - Identifikasi jenis bahan: bahan segar (sayur/daging/buah) atau bahan pokok (minyak/beras/gula/garam)?
   - Bahan SEGAR (Ayam, Cabai, Sayur, Ikan, Buah): mudah busuk, kandungan air tinggi, perlu kulkas → 1-7 hari
   - Bahan POKOK (Minyak, Beras, Gula, Garam): tahan lama, tidak mudah rusak, disimpan kering → 180-365+ hari
   - Daging SEGAR (Ayam, Ikan): sangat mudah busuk, perlu kulkas → 1-3 hari maksimal

2. PREDIKSI MASA SIMPAN:
   - Hitung dari tanggal terakhir update ({terakhir_update_str})
   - Jika {nama_bahan} adalah bahan POKOK (minyak/beras/gula/garam): estimasi MINIMAL 180 hari
   - Jika {nama_bahan} adalah bahan SEGAR (ayam/cabai/sayur): estimasi 1-7 hari
   - Jika {nama_bahan} adalah daging SEGAR (ayam/ikan): estimasi 1-3 hari maksimal

3. KONSISTENSI WAJIB:
   - Jika reason mengatakan "dapat bertahan X hari", maka estimasi_hari HARUS = X
   - JANGAN mengatakan "dapat bertahan 24 hari" tapi estimasi_hari = 0 atau 1
   - JANGAN mengatakan "tahan lama" tapi estimasi_hari < 180 untuk bahan pokok

OUTPUT (HANYA JSON):
{{
  "estimasi_hari": <angka_hari>,
  "reason": "<Deskripsi {nama_bahan} dan alasan. WAJIB sebutkan jumlah hari yang SAMA dengan estimasi_hari. Contoh: '{nama_bahan} adalah bahan pokok yang tahan lama. {nama_bahan} dapat bertahan sekitar 180 hari jika disimpan dengan benar.'>",
  "confidence": <angka_1_100>
}}

CONTOH BENAR untuk MINYAK:
{{"estimasi_hari": 180, "reason": "Minyak adalah bahan pokok yang tahan lama karena tidak mengandung air dan memiliki sifat pengawet alami. Minyak dapat bertahan sekitar 180 hari jika disimpan di tempat yang sejuk, kering, dan terhindar dari cahaya langsung.", "confidence": 90}}

CONTOH BENAR untuk AYAM:
{{"estimasi_hari": 3, "reason": "Ayam adalah daging segar yang sangat mudah busuk karena kandungan protein dan air yang tinggi. Ayam dapat bertahan sekitar 3 hari jika disimpan di kulkas dengan suhu dingin.", "confidence": 90}}

CONTOH SALAH (JANGAN LAKUKAN):
{{"estimasi_hari": 0, "reason": "Ayam dapat bertahan sekitar 24 hari..."}} ❌ INKONSISTEN!
{{"estimasi_hari": 23, "reason": "Minyak tahan lama..."}} ❌ Terlalu kecil untuk minyak!

{retry_note}

KEMBALIKAN HANYA JSON, TANPA TEKS LAIN!
"""
    except Exception as e:
        print(f"[PROMPT] ERROR: Gagal build prompt: {e}")
        logger.error(f"Error building prompt: {e}", exc_info=True)
        raise

def parse_expiration_prediction(ai_response: str, bahan_data: Dict) -> Dict:
    kategori = bahan_data.get('kategori', '')
    
    print(f"\n[PARSING] Memproses hasil untuk kategori: {kategori}")
    
    if not ai_response:
        print(f"[PARSING] ERROR: Tidak ada response dari AI")
        raise ValueError("Tidak ada response dari Ollama AI")

    print(f"[PARSING] Response AI: {ai_response[:200]}...")
    
    # Clean response - remove markdown code blocks
    cleaned_response = re.sub(r'```json|```', '', ai_response, flags=re.IGNORECASE).strip()
    
    # Extract JSON using multiple methods
    json_match = None
    
    # Method 1: Look for JSON pattern (support both estimasi_hari and expired_date for backward compatibility)
    # Pattern yang lebih fleksibel untuk menangkap JSON di tengah text
    json_pattern = r'\{\s*"(?:estimasi_hari|expired_date)"\s*:\s*(?:"[^"]+"|\d+)\s*,\s*"reason"\s*:\s*"[^"]*"\s*,\s*"confidence"\s*:\s*\d+(?:\.\d+)?\s*\}'
    matches = re.findall(json_pattern, cleaned_response, re.DOTALL | re.IGNORECASE)
    
    if matches:
        json_match = matches[0]
        print(f"[PARSING] JSON ditemukan dengan pattern matching (Method 1)")
    else:
        # Method 2: Cari semua kemungkinan JSON object dengan bracket matching
        # Cari semua { dan coba temukan } yang seimbang
        bracket_starts = []
        for i, char in enumerate(cleaned_response):
            if char == '{':
                bracket_starts.append(i)
        
        # Untuk setiap {, coba temukan } yang seimbang
        for start_idx in bracket_starts:
            bracket_count = 0
            json_end = -1
            for i in range(start_idx, len(cleaned_response)):
                if cleaned_response[i] == '{':
                    bracket_count += 1
                elif cleaned_response[i] == '}':
                    bracket_count -= 1
                    if bracket_count == 0:
                        json_end = i
                        break
            
            if json_end != -1:
                potential_json = cleaned_response[start_idx:json_end+1]
                # Validasi bahwa ini adalah JSON yang valid dan mengandung field yang diperlukan
                try:
                    test_parse = json.loads(potential_json)
                    if ('estimasi_hari' in test_parse or 'expired_date' in test_parse) and 'reason' in test_parse and 'confidence' in test_parse:
                        json_match = potential_json
                        print(f"[PARSING] JSON ditemukan dengan bracket matching (Method 2)")
                        break
                except json.JSONDecodeError:
                    continue
        
        # Method 3: Cari JSON setelah keyword tertentu
        if not json_match:
            keywords = ['json:', 'output:', 'result:', 'prediksi:', 'estimasi:', 'response:']
            for keyword in keywords:
                idx = cleaned_response.lower().find(keyword)
                if idx != -1:
                    # Cari { setelah keyword (dalam 200 karakter)
                    search_end = min(idx + 200, len(cleaned_response))
                    json_start = cleaned_response.find('{', idx, search_end)
                    if json_start != -1:
                        # Cari } yang seimbang
                        bracket_count = 0
                        json_end = json_start
                        for i in range(json_start, len(cleaned_response)):
                            if cleaned_response[i] == '{':
                                bracket_count += 1
                            elif cleaned_response[i] == '}':
                                bracket_count -= 1
                                if bracket_count == 0:
                                    json_end = i
                                    break
                            # Batasi pencarian maksimal 2000 karakter
                            if i - json_start > 2000:
                                break
                        
                        if bracket_count == 0:
                            potential_json = cleaned_response[json_start:json_end+1]
                            try:
                                test_parse = json.loads(potential_json)
                                if ('estimasi_hari' in test_parse or 'expired_date' in test_parse) and 'reason' in test_parse and 'confidence' in test_parse:
                                    json_match = potential_json
                                    print(f"[PARSING] JSON ditemukan setelah keyword '{keyword}' (Method 3)")
                                    break
                            except:
                                pass
        
        # Method 4: Cari dengan regex yang lebih luas (untuk JSON yang mungkin terpotong atau ada whitespace)
        if not json_match:
            # Pattern yang lebih toleran terhadap whitespace dan format
            flexible_pattern = r'\{\s*["\']?(?:estimasi_hari|expired_date)["\']?\s*:\s*(?:"[^"]*"|\d+)\s*,\s*["\']?reason["\']?\s*:\s*"[^"]*"\s*,\s*["\']?confidence["\']?\s*:\s*\d+(?:\.\d+)?\s*\}'
            flexible_matches = re.findall(flexible_pattern, cleaned_response, re.DOTALL | re.IGNORECASE)
            if flexible_matches:
                # Coba parse yang pertama
                for match in flexible_matches:
                    try:
                        # Normalize quotes
                        normalized = match.replace("'", '"')
                        test_parse = json.loads(normalized)
                        if ('estimasi_hari' in test_parse or 'expired_date' in test_parse) and 'reason' in test_parse and 'confidence' in test_parse:
                            json_match = normalized
                            print(f"[PARSING] JSON ditemukan dengan flexible pattern (Method 4)")
                            break
                    except:
                        continue
    
    if not json_match:
        print(f"[PARSING] ERROR: Tidak ada JSON ditemukan dalam response")
        print(f"[PARSING] Response lengkap: {cleaned_response[:1000]}...")
        raise ValueError("Tidak dapat menemukan JSON dalam response AI")

    print(f"[PARSING] JSON yang ditemukan: {json_match}")
    
    try:
        parsed = json.loads(json_match)
        print(f"[PARSING] JSON berhasil di-parse")
        
        # Validasi field wajib - cek apakah ada estimasi_hari atau expired_date
        has_estimasi_hari = 'estimasi_hari' in parsed
        has_expired_date = 'expired_date' in parsed
        
        if not has_estimasi_hari and not has_expired_date:
            print(f"[PARSING] ERROR: Field 'estimasi_hari' atau 'expired_date' tidak ditemukan")
            raise ValueError("Field 'estimasi_hari' atau 'expired_date' tidak ditemukan dalam response")
        
        required_fields = ['reason', 'confidence']
        for field in required_fields:
            if field not in parsed:
                print(f"[PARSING] ERROR: Field '{field}' tidak ditemukan")
                raise ValueError(f"Field '{field}' tidak ditemukan dalam response")
        
        ai_date = None
        ai_days = None
        ai_confidence = None
        ai_reason = parsed.get('reason', '').strip()
        
        # Ambil estimasi_hari atau hitung dari expired_date
        if has_estimasi_hari:
            # Prioritas: gunakan estimasi_hari jika ada
            try:
                ai_days = int(parsed['estimasi_hari'])
                print(f"[PARSING] Menggunakan estimasi_hari dari AI: {ai_days} hari")
            except (ValueError, TypeError):
                print(f"[PARSING] ERROR: estimasi_hari tidak valid: {parsed.get('estimasi_hari', 'N/A')}")
                raise ValueError(f"estimasi_hari harus berupa angka, mendapat: {parsed.get('estimasi_hari', 'N/A')}")
        elif has_expired_date:
            # Fallback: parse expired_date jika estimasi_hari tidak ada
            print(f"[PARSING] INFO: estimasi_hari tidak ditemukan, mencoba parse expired_date")
            expired_date_str = parsed['expired_date']
            
            # Coba parse format yang salah seperti "2025-12-15 + 16 hari"
            if ' + ' in expired_date_str or ' +' in expired_date_str:
                # Extract angka hari dari format "2025-12-15 + 16 hari"
                hari_match = re.search(r'\+?\s*(\d+)\s*hari', expired_date_str, re.IGNORECASE)
                if hari_match:
                    ai_days = int(hari_match.group(1))
                    print(f"[PARSING] Mengekstrak estimasi_hari dari format salah: {ai_days} hari")
                else:
                    raise ValueError(f"Tidak dapat mengekstrak estimasi_hari dari format: {expired_date_str}")
            else:
                # Coba parse sebagai tanggal normal
                try:
                    date = datetime.strptime(expired_date_str, '%Y-%m-%d')
                    
                    # Ambil terakhir_update dari bahan_data
                    terakhir_update_str = bahan_data.get('terakhir_update', '')
                    if terakhir_update_str:
                        try:
                            terakhir_update = datetime.strptime(terakhir_update_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
                        except ValueError:
                            terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                    else:
                        terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                    
                    # Hitung estimasi_hari dari selisih tanggal
                    ai_days = (date - terakhir_update).days
                    if ai_days <= 0:
                        raise ValueError(f"expired_date harus lebih besar dari terakhir_update")
                    print(f"[PARSING] Menghitung estimasi_hari dari expired_date: {ai_days} hari")
                except ValueError as e:
                    print(f"[PARSING] ERROR: Tidak dapat parse expired_date: {expired_date_str}")
                    raise ValueError(f"Format expired_date tidak valid: {str(e)}")
        
        if ai_days is None or ai_days <= 0:
            raise ValueError(f"estimasi_hari harus lebih besar dari 0, mendapat: {ai_days}")
        
        # Hitung expired_date dari estimasi_hari
        terakhir_update_str = bahan_data.get('terakhir_update', '')
        if terakhir_update_str:
            try:
                terakhir_update = datetime.strptime(terakhir_update_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
            except ValueError:
                terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Validasi estimasi_hari berdasarkan jenis bahan (jika bisa diidentifikasi dari nama)
        nama_bahan_lower = bahan_data.get('nama_bahan', '').lower()
        original_ai_days = ai_days
        reason_updated = False
        
        # Validasi khusus untuk bahan yang seharusnya tahan lama
        if 'minyak' in nama_bahan_lower or 'oil' in nama_bahan_lower:
            if ai_days < 180:
                print(f"[PARSING] ERROR: Estimasi_hari untuk Minyak terlalu kecil ({ai_days} hari)")
                print(f"[PARSING] Minyak adalah bahan pokok yang tahan lama, HARUS minimal 180 hari")
                print(f"[PARSING] Memperbaiki menjadi 180 hari minimum")
                ai_days = 180
                reason_updated = True
        elif 'beras' in nama_bahan_lower or 'rice' in nama_bahan_lower:
            if ai_days < 365:
                print(f"[PARSING] ERROR: Estimasi_hari untuk Beras terlalu kecil ({ai_days} hari)")
                print(f"[PARSING] Beras adalah bahan pokok yang sangat tahan lama, HARUS minimal 365 hari")
                print(f"[PARSING] Memperbaiki menjadi 365 hari minimum")
                ai_days = 365
                reason_updated = True
        elif 'gula' in nama_bahan_lower or 'sugar' in nama_bahan_lower:
            if ai_days < 365:
                print(f"[PARSING] ERROR: Estimasi_hari untuk Gula terlalu kecil ({ai_days} hari)")
                print(f"[PARSING] Gula adalah bahan pokok yang sangat tahan lama, HARUS minimal 365 hari")
                print(f"[PARSING] Memperbaiki menjadi 365 hari minimum")
                ai_days = 365
                reason_updated = True
        elif 'garam' in nama_bahan_lower or 'salt' in nama_bahan_lower:
            if ai_days < 730:
                print(f"[PARSING] ERROR: Estimasi_hari untuk Garam terlalu kecil ({ai_days} hari)")
                print(f"[PARSING] Garam adalah bahan pokok yang hampir tidak pernah expired, HARUS minimal 730 hari")
                print(f"[PARSING] Memperbaiki menjadi 730 hari minimum")
                ai_days = 730
                reason_updated = True
        
        # Validasi untuk bahan segar - tidak boleh terlalu lama
        if any(x in nama_bahan_lower for x in ['ayam', 'chicken', 'ikan', 'fish', 'udang', 'shrimp']):
            if ai_days > 7:
                print(f"[PARSING] ERROR: Estimasi_hari untuk daging segar terlalu besar ({ai_days} hari)")
                print(f"[PARSING] Daging segar maksimal 3-7 hari, memperbaiki menjadi 3 hari")
                ai_days = 3
                reason_updated = True
        
        # Jika estimasi_hari diubah, perlu update reason dan expired_date juga
        if ai_days != original_ai_days:
            print(f"[PARSING] Estimasi_hari diubah dari {original_ai_days} menjadi {ai_days} hari")
            
            # Recalculate expired_date
            expired_date = terakhir_update + timedelta(days=ai_days)
            ai_date = expired_date.strftime('%Y-%m-%d')
            
            # Update reason untuk konsistensi
            nama_bahan_display = bahan_data.get('nama_bahan', 'Bahan ini')
            
            if 'minyak' in nama_bahan_lower or 'oil' in nama_bahan_lower:
                ai_reason = f"{nama_bahan_display} adalah bahan pokok yang tahan lama karena tidak mengandung air dan memiliki sifat pengawet alami. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk, kering, dan terhindar dari cahaya langsung."
            elif 'ayam' in nama_bahan_lower or 'chicken' in nama_bahan_lower:
                ai_reason = f"{nama_bahan_display} adalah daging segar yang sangat mudah busuk karena kandungan protein dan air yang tinggi. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di kulkas dengan suhu dingin."
            elif 'cabai' in nama_bahan_lower or 'cabe' in nama_bahan_lower or 'chili' in nama_bahan_lower:
                ai_reason = f"{nama_bahan_display} adalah bahan segar dengan kandungan air tinggi yang mudah busuk. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk dan kering."
            else:
                # Update reason dengan jumlah hari yang benar
                ai_reason = re.sub(r'\d+\s*hari', f'{ai_days} hari', ai_reason, flags=re.IGNORECASE)
            
            print(f"[PARSING] Reason diperbaiki untuk konsistensi: {ai_reason}")
        
        # Hitung expired_date = terakhir_update + estimasi_hari
        expired_date = terakhir_update + timedelta(days=ai_days)
        ai_date = expired_date.strftime('%Y-%m-%d')
        
        print(f"[PARSING] expired_date dihitung: {ai_date} = {terakhir_update_str} + {ai_days} hari")
        
        # Validasi konsistensi: ekstrak jumlah hari dari reason dan bandingkan dengan estimasi_hari
        if ai_reason:
            # Cari angka hari dalam reason (contoh: "16 hari", "30 hari", "365 hari")
            hari_patterns = [
                r'(\d+)\s*hari',  # "16 hari", "30 hari"
                r'(\d+)\s*day',   # "16 day", "30 day"
                r'(\d+)\s*h',     # "16h", "30h"
                r'(\d+)\s*d',     # "16d", "30d"
                r'(\d+)\s*bulan', # "6 bulan" -> konversi ke hari
                r'(\d+)\s*month', # "6 month" -> konversi ke hari
                r'(\d+)\s*tahun', # "1 tahun" -> konversi ke hari
                r'(\d+)\s*year',  # "1 year" -> konversi ke hari
            ]
            
            reason_days = None
            for pattern in hari_patterns:
                matches = re.findall(pattern, ai_reason, re.IGNORECASE)
                if matches:
                    num = int(matches[0])
                    # Konversi bulan/tahun ke hari
                    if 'bulan' in pattern or 'month' in pattern:
                        reason_days = num * 30
                    elif 'tahun' in pattern or 'year' in pattern:
                        reason_days = num * 365
                    else:
                        reason_days = num
                    break
            
            if reason_days is not None:
                # Bandingkan dengan ai_days
                diff = abs(ai_days - reason_days)
                if diff > 2:  # Toleransi 2 hari untuk perbedaan kecil
                    print(f"[PARSING] ERROR: INKONSISTENSI DETECTED!")
                    print(f"[PARSING] Reason menyebutkan: {reason_days} hari")
                    print(f"[PARSING] estimasi_hari menunjukkan: {ai_days} hari")
                    print(f"[PARSING] Selisih: {diff} hari - INI SANGAT TIDAK KONSISTEN!")
                    print(f"[PARSING] Memperbaiki estimasi_hari sesuai dengan reason...")

                    # Perbaiki estimasi_hari sesuai dengan reason (reason lebih akurat karena AI sudah berpikir)
                    ai_days = reason_days
                    expired_date = terakhir_update + timedelta(days=ai_days)
                    ai_date = expired_date.strftime('%Y-%m-%d')

                    print(f"[PARSING] estimasi_hari diperbaiki menjadi: {ai_days} hari")
                    print(f"[PARSING] expired_date diperbaiki menjadi: {ai_date}")
                    
                    # Update reason untuk memastikan konsistensi
                    nama_bahan_display = bahan_data.get('nama_bahan', 'Bahan ini')
                    nama_bahan_lower = bahan_data.get('nama_bahan', '').lower()
                    
                    # Perbaiki reason berdasarkan jenis bahan
                    if 'minyak' in nama_bahan_lower or 'oil' in nama_bahan_lower:
                        ai_reason = f"{nama_bahan_display} adalah bahan pokok yang tahan lama karena tidak mengandung air dan memiliki sifat pengawet alami. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk, kering, dan terhindar dari cahaya langsung."
                    elif 'ayam' in nama_bahan_lower or 'chicken' in nama_bahan_lower:
                        ai_reason = f"{nama_bahan_display} adalah daging segar yang sangat mudah busuk karena kandungan protein dan air yang tinggi. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di kulkas dengan suhu dingin."
                    elif 'cabai' in nama_bahan_lower or 'cabe' in nama_bahan_lower or 'chili' in nama_bahan_lower:
                        ai_reason = f"{nama_bahan_display} adalah bahan segar dengan kandungan air tinggi yang mudah busuk. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk dan kering."
                    else:
                        # Update reason dengan jumlah hari yang benar
                        # Ganti angka hari yang salah dengan yang benar
                        ai_reason = re.sub(r'\d+\s*hari', f'{ai_days} hari', ai_reason, flags=re.IGNORECASE)
                    
                    print(f"[PARSING] Reason diperbaiki untuk konsistensi: {ai_reason}")
                else:
                    print(f"[PARSING] Konsistensi OK: reason {reason_days} hari, estimasi_hari {ai_days} hari (selisih {diff} hari)")
            else:
                print(f"[PARSING] INFO: Tidak ditemukan jumlah hari eksplisit dalam reason, menggunakan estimasi_hari yang diberikan")
        
        # Hitung hari dari sekarang (real-time calculation)
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        days_from_today = (datetime.strptime(ai_date, '%Y-%m-%d') - today).days
        
        print(f"[PARSING] Tanggal valid: {ai_date} ({ai_days} hari dari terakhir update, {days_from_today} hari dari sekarang)")
        
        # Validasi confidence
        try:
            conf_value = parsed['confidence']
            if isinstance(conf_value, str):
                conf_value = conf_value.replace('%', '').strip()
            ai_confidence = float(conf_value)
            # Jika model mengembalikan 0-1, konversi ke 0-100
            if 0 < ai_confidence <= 1:
                print(f"[PARSING] Info: confidence {ai_confidence} diasumsikan skala 0-1, dikonversi ke persen")
                ai_confidence = ai_confidence * 100.0
            
            if ai_confidence < 0 or ai_confidence > 100:
                print(f"[PARSING] WARNING: Confidence {ai_confidence} di luar range 0-100%")
                raise ValueError(f"Confidence harus antara 0-100%, mendapat: {ai_confidence}")
            
            print(f"[PARSING] Confidence: {ai_confidence:.1f}%")
            
        except (ValueError, TypeError) as e:
            print(f"[PARSING] ERROR: Confidence tidak valid: {parsed.get('confidence', 'N/A')}")
            raise ValueError(f"Confidence tidak valid: {str(e)}")
        
        # Validasi reason
        try:
            if not ai_reason or len(ai_reason) < 10:
                print(f"[PARSING] ERROR: Reason terlalu pendek atau kosong")
                raise ValueError("Reason terlalu pendek atau kosong")
            
            # PENTING: Validasi bahwa reason menyebutkan nama bahan yang benar
            nama_bahan = bahan_data.get('nama_bahan', '').lower()
            ai_reason_lower = ai_reason.lower()
            
            # Cek apakah reason menyebutkan nama bahan yang benar
            # Untuk nama bahan yang umum, cek beberapa variasi
            bahan_mentions = []
            if 'minyak' in nama_bahan or 'oil' in nama_bahan:
                bahan_mentions = ['minyak', 'oil']
            elif 'ayam' in nama_bahan or 'chicken' in nama_bahan:
                bahan_mentions = ['ayam', 'chicken']
            elif 'cabai' in nama_bahan or 'cabe' in nama_bahan or 'chili' in nama_bahan:
                bahan_mentions = ['cabai', 'cabe', 'chili']
            elif 'beras' in nama_bahan or 'rice' in nama_bahan:
                bahan_mentions = ['beras', 'rice']
            elif 'gula' in nama_bahan or 'sugar' in nama_bahan:
                bahan_mentions = ['gula', 'sugar']
            elif 'garam' in nama_bahan or 'salt' in nama_bahan:
                bahan_mentions = ['garam', 'salt']
            else:
                # Untuk bahan lain, gunakan nama bahan langsung
                bahan_mentions = [nama_bahan]
            
            # Cek apakah reason menyebutkan nama bahan yang benar
            reason_mentions_correct_bahan = any(mention in ai_reason_lower for mention in bahan_mentions)
            
            # Cek apakah reason menyebutkan bahan lain yang salah
            wrong_bahan_mentions = []
            if 'minyak' in nama_bahan or 'oil' in nama_bahan:
                # Jika bahan adalah Minyak, jangan boleh menyebutkan Ayam, Cabai, dll
                wrong_bahan_mentions = ['ayam', 'chicken', 'cabai', 'cabe', 'chili', 'ikan', 'fish', 'sayur', 'vegetable']
            elif 'ayam' in nama_bahan or 'chicken' in nama_bahan:
                # Jika bahan adalah Ayam, jangan boleh menyebutkan Minyak, Beras, dll
                wrong_bahan_mentions = ['minyak', 'oil', 'beras', 'rice', 'gula', 'sugar']
            elif 'cabai' in nama_bahan or 'cabe' in nama_bahan or 'chili' in nama_bahan:
                # Jika bahan adalah Cabai, jangan boleh menyebutkan Ayam, Minyak, dll
                wrong_bahan_mentions = ['ayam', 'chicken', 'minyak', 'oil']
            
            reason_mentions_wrong_bahan = any(wrong in ai_reason_lower for wrong in wrong_bahan_mentions)
            
            if reason_mentions_wrong_bahan:
                print(f"[PARSING] WARNING: Reason menyebutkan bahan yang salah!")
                print(f"[PARSING] Bahan yang diprediksi: {nama_bahan}")
                print(f"[PARSING] Reason asli dari AI: {ai_reason}")
                print(f"[PARSING] Reason menyebutkan bahan yang salah, akan diperbaiki...")
                
                # Perbaiki reason dengan mengganti bahan yang salah dengan bahan yang benar
                nama_bahan_display = bahan_data.get('nama_bahan', 'Bahan ini')
                
                # Ganti dengan reason yang benar berdasarkan jenis bahan
                if 'minyak' in nama_bahan or 'oil' in nama_bahan:
                    # Minyak adalah bahan pokok yang tahan lama
                    # PENTING: Minyak HARUS memiliki estimasi_hari yang besar (180-365 hari)
                    # Jika estimasi_hari terlalu kecil (< 180), berarti AI salah menganalisis
                    if ai_days < 180:
                        print(f"[PARSING] WARNING: Estimasi_hari untuk Minyak terlalu kecil ({ai_days} hari)")
                        print(f"[PARSING] Minyak adalah bahan pokok yang tahan lama, memperbaiki menjadi 180 hari minimum")
                        ai_days = 180
                        # Recalculate expired_date
                        terakhir_update_str = bahan_data.get('terakhir_update', '')
                        if terakhir_update_str:
                            try:
                                terakhir_update = datetime.strptime(terakhir_update_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
                            except ValueError:
                                terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                        else:
                            terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                        expired_date = terakhir_update + timedelta(days=ai_days)
                        ai_date = expired_date.strftime('%Y-%m-%d')
                    
                    ai_reason = f"{nama_bahan_display} adalah bahan pokok yang tahan lama karena tidak mengandung air dan memiliki sifat pengawet alami. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk, kering, dan terhindar dari cahaya langsung."
                elif 'ayam' in nama_bahan or 'chicken' in nama_bahan:
                    # Ayam adalah daging segar
                    ai_reason = f"{nama_bahan_display} adalah daging segar yang sangat mudah busuk karena kandungan protein dan air yang tinggi. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di kulkas dengan suhu dingin."
                elif 'cabai' in nama_bahan or 'cabe' in nama_bahan or 'chili' in nama_bahan:
                    # Cabai adalah bahan segar
                    ai_reason = f"{nama_bahan_display} adalah bahan segar dengan kandungan air tinggi yang mudah busuk. {nama_bahan_display} dapat bertahan sekitar {ai_days} hari jika disimpan di tempat yang sejuk dan kering."
                else:
                    # Untuk bahan lain, gunakan template umum
                    ai_reason = f"{nama_bahan_display} adalah bahan makanan yang dapat bertahan sekitar {ai_days} hari jika disimpan dengan baik."
                
                print(f"[PARSING] Reason diperbaiki menjadi: {ai_reason}")
            
            if not reason_mentions_correct_bahan:
                print(f"[PARSING] WARNING: Reason tidak menyebutkan nama bahan yang benar!")
                print(f"[PARSING] Bahan yang diprediksi: {nama_bahan}")
                print(f"[PARSING] Reason: {ai_reason}")
                print(f"[PARSING] Menambahkan nama bahan ke reason...")
                
                # Tambahkan nama bahan di awal reason jika belum ada
                nama_bahan_display = bahan_data.get('nama_bahan', 'Bahan ini')
                if not any(mention in ai_reason_lower for mention in bahan_mentions):
                    ai_reason = f"{nama_bahan_display} adalah {ai_reason.lower()}"
                    print(f"[PARSING] Reason diperbaiki menjadi: {ai_reason}")
            
            # Validasi: reason harus menyebutkan jumlah hari
            hari_patterns = [
                r'(\d+)\s*hari', r'(\d+)\s*day', r'(\d+)\s*h', r'(\d+)\s*d',
                r'(\d+)\s*bulan', r'(\d+)\s*month', r'(\d+)\s*tahun', r'(\d+)\s*year'
            ]
            has_hari_mention = any(re.search(pattern, ai_reason, re.IGNORECASE) for pattern in hari_patterns)
            
            if not has_hari_mention:
                print(f"[PARSING] WARNING: Reason tidak menyebutkan jumlah hari eksplisit")
                print(f"[PARSING] Reason: {ai_reason}")
                # Tidak error, hanya warning karena sudah ada validasi konsistensi sebelumnya
            
            # Potong reason jika terlalu panjang
            if len(ai_reason) > 200:
                sentences = [s.strip() for s in ai_reason.split('.') if s.strip()]
                ai_reason = '. '.join(sentences[:2]).strip()
                if ai_reason and not ai_reason.endswith('.'):
                    ai_reason += '.'
                print(f"[PARSING] Alasan dipotong menjadi: {ai_reason}")
            
            print(f"[PARSING] Reason: {ai_reason}")
        except (KeyError, AttributeError) as e:
            print(f"[PARSING] ERROR: Reason tidak ditemukan atau tidak valid")
            raise ValueError(f"Reason tidak valid: {str(e)}")
        
        # Final validation
        if not ai_date or ai_days is None or ai_confidence is None or not ai_reason:
            print(f"[PARSING] ERROR: Data tidak lengkap")
            print(f"  - Date: {ai_date}")
            print(f"  - Days: {ai_days}")
            print(f"  - Confidence: {ai_confidence}")
            print(f"  - Reason: {bool(ai_reason)}")
            raise ValueError("Data prediksi tidak lengkap dari AI")
        
        result = {
            'expired_date': ai_date,
            'days': ai_days,
            'reason': ai_reason,
            'confidence': round(ai_confidence, 2)
        }
        
        print(f"\n[PARSING] HASIL AKHIR:")
        print(f"  - Tanggal Expired: {result['expired_date']}")
        print(f"  - Total Hari: {result['days']} hari")
        print(f"  - Confidence: {result['confidence']:.1f}%")
        print(f"  - Reason: {result['reason']}")
        print(f"{'='*80}\n")
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"[PARSING] ERROR: JSON decode error: {e}")
        print(f"[PARSING] JSON yang gagal di-parse: {json_match}")
        raise ValueError(f"Gagal parse JSON: {str(e)}")
    except Exception as e:
        print(f"[PARSING] ERROR: {str(e)}")
        raise

def predict_expiration(bahan_data: Dict) -> Dict:
    """Predict expiration date for a bahan"""
    try:
        kategori = bahan_data.get('kategori', '')
        nama_bahan = bahan_data.get('nama_bahan', 'Unknown')
        max_retries = 3
        
        print(f"\n{'#'*80}")
        print(f"# PREDIKSI EXPIRED: {nama_bahan} ({kategori})")
        print(f"{'#'*80}")
        print(f"Waktu mulai: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check if Ollama is available before starting
        if not is_ollama_available():
            config = get_ollama_config()
            error_msg = f"Ollama tidak tersedia di {config['url']} dengan model {config['model']}"
            print(f"[PROCESS] ERROR: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'bahan': bahan_data
            }
        
        for attempt in range(max_retries):
            try:
                is_retry = attempt > 0
                previous_error = ""
                
                if is_retry:
                    print(f"\n[PROCESS] RETRY #{attempt} untuk {kategori}")
                    previous_error = "Perbaikan diperlukan untuk memenuhi semua aturan"
                
                prompt = build_expiration_prompt(bahan_data, is_retry=is_retry, previous_error=previous_error)
                
                print(f"\n[PROCESS] Prompt dibuat (attempt {attempt + 1}/{max_retries})")
                print(f"[PROCESS] Panjang prompt: {len(prompt)} karakter")
                
                ai_response = call_ollama_api(prompt, timeout=240, retry=1)
                
                if not ai_response:
                    if attempt < max_retries - 1:
                        print(f"[PROCESS] Tidak ada response, akan retry...")
                        continue
                    error_msg = f"Gagal mendapatkan response dari Ollama untuk {kategori} setelah {max_retries} kali attempt"
                    print(f"[PROCESS] ERROR: {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg,
                        'bahan': bahan_data
                    }
                
                try:
                    prediction = parse_expiration_prediction(ai_response, bahan_data)
                    
                    print(f"[PROCESS] [OK] Prediksi selesai untuk {kategori} (attempt {attempt + 1})")
                    print(f"[PROCESS] Waktu selesai: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                    
                    return {
                        'success': True,
                        'bahan': bahan_data,
                        'prediction': prediction
                    }
                    
                except ValueError as e:
                    error_str = str(e)
                    if any(keyword in error_str.lower() for keyword in ['tanggal', 'masa depan', 'expired', 'format', 'confidence', 'reason']):
                        if attempt < max_retries - 1:
                            print(f"[PROCESS] Validasi gagal: {error_str}, akan retry...")
                            continue
                        else:
                            error_msg = f"Validasi gagal setelah {max_retries} kali attempt: {error_str}"
                            print(f"[PROCESS] ERROR: {error_msg}")
                            return {
                                'success': False,
                                'error': error_msg,
                                'bahan': bahan_data
                            }
                    else:
                        error_msg = f"Error parsing untuk {kategori}: {error_str}"
                        print(f"[PROCESS] ERROR: {error_msg}")
                        return {
                            'success': False,
                            'error': error_msg,
                            'bahan': bahan_data
                        }
                        
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"[PROCESS] Exception: {str(e)}, akan retry...")
                    continue
                error_msg = f"Unexpected error untuk {kategori}: {str(e)}"
                print(f"[PROCESS] ERROR: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg,
                    'bahan': bahan_data
                }
        
        # If we get here, all retries failed
        error_msg = f"Gagal memprediksi {kategori} setelah {max_retries} kali attempt"
        print(f"[PROCESS] ERROR: {error_msg}")
        return {
            'success': False,
            'error': error_msg,
            'bahan': bahan_data
        }
    except Exception as e:
        error_msg = f"Unexpected error in predict_expiration: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"[PROCESS] FATAL ERROR: {error_msg}")
        return {
            'success': False,
            'error': error_msg,
            'bahan': bahan_data
        }

@app.route('/predict-expiration', methods=['POST'])
def predict_expiration_endpoint():
    try:
        data = request.get_json()
        print(f"[ENDPOINT] /predict-expiration called")
        
        if not data or 'bahan' not in data:
            print(f"[ENDPOINT] ERROR: Data bahan tidak ditemukan")
            return jsonify({
                'success': False,
                'message': 'Data bahan tidak ditemukan'
            }), 400
        
        bahan_data = data['bahan']
        print(f"[ENDPOINT] Processing bahan: {bahan_data.get('nama_bahan', 'Unknown')}")
        
        result = predict_expiration(bahan_data)
        
        if result['success']:
            print(f"[ENDPOINT] Success: {result['prediction'].get('expired_date', 'N/A')}")
            return jsonify({
                'success': True,
                'data': result
            }), 200
        else:
            print(f"[ENDPOINT] Failed: {result.get('error', 'Unknown error')}")
            return jsonify({
                'success': False,
                'message': result.get('error', 'Gagal memprediksi'),
                'data': result
            }), 500
            
    except Exception as e:
        error_msg = f"Error in predict-expiration endpoint: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"[ENDPOINT] EXCEPTION: {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan saat memprediksi expired',
            'error': str(e)
        }), 500

@app.route('/predict-expiration-batch', methods=['POST'])
def predict_expiration_batch_endpoint():
    try:
        data = request.get_json()
        
        if not data or 'bahan_list' not in data:
            print(f"[BATCH] ERROR: Data bahan_list tidak ditemukan")
            return jsonify({
                'success': False,
                'message': 'Data bahan_list tidak ditemukan'
            }), 400
        
        bahan_list = data['bahan_list']
        if not isinstance(bahan_list, list):
            print(f"[BATCH] ERROR: bahan_list bukan array")
            return jsonify({
                'success': False,
                'message': 'bahan_list harus berupa array'
            }), 400
        
        if len(bahan_list) == 0:
            print(f"[BATCH] ERROR: bahan_list kosong")
            return jsonify({
                'success': False,
                'message': 'bahan_list tidak boleh kosong'
            }), 400
        
        batch_start_time = datetime.now()
        print(f"\n{'#'*80}")
        print(f"# BATCH PREDICTION: {len(bahan_list)} bahan")
        print(f"{'#'*80}")
        print(f"Waktu mulai batch: {batch_start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        results = []
        errors = []
        
        for idx, bahan_data in enumerate(bahan_list, 1):
            item_start_time = datetime.now()
            try:
                nama = bahan_data.get('nama_bahan', f'Bahan-{idx}')
                kategori = bahan_data.get('kategori', '')
                stok = bahan_data.get('stok_bahan', '')
                satuan = bahan_data.get('satuan', '')
                
                print(f"\n[{idx}/{len(bahan_list)}] Memproses: {nama} ({kategori})")
                print(f"[DATA] Stok: {stok} {satuan}, ID: {bahan_data.get('id_bahan', 'N/A')}")
                print(f"[DATA] Data lengkap: {list(bahan_data.keys())}")
                
                result = predict_expiration(bahan_data)
                item_elapsed = (datetime.now() - item_start_time).total_seconds()
                if result['success']:
                    results.append(result)
                    pred = result['prediction']
                    print(f"[{idx}/{len(bahan_list)}] [OK] Berhasil: {pred['expired_date']} ({pred.get('days', 'N/A')} hari) - {item_elapsed:.1f}s")
                else:
                    errors.append({
                        'bahan': nama,
                        'kategori': kategori,
                        'error': result.get('error', 'Unknown error')
                    })
                    print(f"[{idx}/{len(bahan_list)}] [FAIL] Gagal: {result.get('error', 'Unknown error')} - {item_elapsed:.1f}s")
            except Exception as e:
                nama = bahan_data.get('nama_bahan', f'Bahan-{idx}')
                kategori = bahan_data.get('kategori', '')
                error_msg = f"Exception saat memproses {nama}: {str(e)}"
                print(f"[{idx}/{len(bahan_list)}] [FAIL] Exception: {error_msg}")
                logger.error(error_msg, exc_info=True)
                errors.append({
                    'bahan': nama,
                    'kategori': kategori,
                    'error': error_msg
                })
        
        batch_end_time = datetime.now()
        batch_elapsed = (batch_end_time - batch_start_time).total_seconds()
        print(f"\n{'#'*80}")
        print(f"# BATCH PREDICTION SELESAI")
        print(f"{'#'*80}")
        print(f"Total: {len(bahan_list)}")
        print(f"Berhasil: {len(results)}")
        print(f"Gagal: {len(errors)}")
        print(f"Waktu mulai: {batch_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Waktu selesai: {batch_end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total waktu: {batch_elapsed:.1f} detik ({batch_elapsed/60:.1f} menit)")
        print(f"{'#'*80}\n")
        
        return jsonify({
            'success': True,
            'data': {
                'total': len(bahan_list),
                'berhasil': len(results),
                'gagal': len(errors),
                'predictions': results,
                'errors': errors
            }
        }), 200
        
    except Exception as e:
        error_msg = f"Error in predict-expiration-batch endpoint: {str(e)}"
        logger.error(error_msg, exc_info=True)
        print(f"\n[ERROR] Batch prediction error: {error_msg}\n")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Terjadi kesalahan saat memprediksi expired',
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    ollama_available = is_ollama_available()
    config = get_ollama_config()
    
    return jsonify({
        'status': 'running',
        'message': 'Expired Prediction Service is running',
        'ollama': 'ready' if ollama_available else 'not_available',
        'ollama_url': config['url'],
        'ollama_model': config['model']
    }), 200

@app.route('/test-ollama', methods=['GET'])
def test_ollama():
    try:
        if not is_ollama_available():
            config = get_ollama_config()
            return jsonify({
                'success': False,
                'message': 'Ollama not available',
                'error': f'Ollama not available at {config["url"]}'
            }), 503
        
        result_text = call_ollama_api("Hello, are you working?")
        
        if result_text:
            return jsonify({
                'success': True,
                'message': 'Ollama AI is working',
                'response': result_text
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Ollama API returned no response'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error testing Ollama',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Expired Prediction Service (Ollama AI)')
    parser.add_argument('--port', '-p', type=int, default=None,
                        help='Port number untuk service (default: dari EXPIRED_PREDICTION_SERVICE_PORT atau 5001)')
    parser.add_argument('--host', type=str, default=None,
                        help='Host address untuk service (default: dari EXPIRED_PREDICTION_SERVICE_HOST atau 0.0.0.0)')
    
    args = parser.parse_args()
    
    logger.info("Starting Expired Prediction Service (Ollama AI)")
    logger.info("Service endpoints: predict-expiration, predict-expiration-batch, health, test-ollama")
    
    config = get_ollama_config()
    if not is_ollama_available():
        logger.warning("Ollama not available at %s (model %s)", config['url'], config['model'])
    else:
        logger.info("Ollama ready at %s with model %s", config['url'], config['model'])
    
    # Priority: command line argument > environment variable > default
    port = args.port if args.port is not None else int(os.getenv('EXPIRED_PREDICTION_SERVICE_PORT', '5001'))
    host = args.host if args.host is not None else os.getenv('EXPIRED_PREDICTION_SERVICE_HOST', '0.0.0.0')
    
    logger.info("Starting service on %s:%s", host, port)
    print(f"\n{'='*80}")
    print(f"Expired Prediction Service running on http://{host}:{port}")
    print(f"{'='*80}\n")
    app.run(host=host, port=port, debug=False)