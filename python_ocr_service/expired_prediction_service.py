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
        nama_bahan = bahan_data.get('nama_bahan', '').lower()
        kategori = bahan_data.get('kategori', '')
        
        # Mapping karakteristik bahan berdasarkan nama untuk membantu AI
        bahan_karakteristik = ""
        if 'cabai' in nama_bahan or 'cabe' in nama_bahan or 'chili' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Cabai adalah bahan SEGAR dengan kandungan air tinggi, mudah busuk, dan memerlukan penyimpanan yang baik. Estimasi realistis: 3-7 hari.\n"
        elif 'ayam' in nama_bahan or 'chicken' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Ayam adalah DAGING SEGAR yang sangat mudah busuk, memerlukan suhu dingin, dan harus dikonsumsi cepat. Estimasi realistis: 1-3 hari.\n"
        elif 'minyak' in nama_bahan or 'oil' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Minyak adalah bahan POKOK yang tahan lama, tidak mengandung air, dan memiliki sifat pengawet alami. Estimasi realistis: 180-365 hari.\n"
        elif 'beras' in nama_bahan or 'rice' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Beras adalah bahan POKOK kering yang sangat tahan lama jika disimpan di tempat kering. Estimasi realistis: 365-730 hari.\n"
        elif 'gula' in nama_bahan or 'sugar' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Gula adalah bahan POKOK kering yang sangat tahan lama. Estimasi realistis: 365-730 hari.\n"
        elif 'garam' in nama_bahan or 'salt' in nama_bahan:
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Garam adalah bahan POKOK yang hampir tidak pernah expired jika disimpan kering. Estimasi realistis: 730+ hari.\n"
        elif any(x in nama_bahan for x in ['sayur', 'vegetable', 'daun', 'kangkung', 'bayam', 'selada']):
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Sayuran hijau adalah bahan SEGAR yang sangat mudah busuk dan memerlukan penyimpanan dingin. Estimasi realistis: 2-5 hari.\n"
        elif any(x in nama_bahan for x in ['ikan', 'fish', 'udang', 'shrimp']):
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Ikan/seafood segar adalah bahan yang sangat mudah busuk dan memerlukan suhu dingin. Estimasi realistis: 1-2 hari.\n"
        elif any(x in nama_bahan for x in ['buah', 'fruit', 'apel', 'jeruk', 'mangga']):
            bahan_karakteristik = "\n🔍 KARAKTERISTIK SPESIFIK: Buah segar adalah bahan yang mudah busuk tergantung jenisnya. Estimasi realistis: 3-7 hari.\n"
        
        nama_bahan = bahan_data.get('nama_bahan', '')  # Kembalikan ke format asli untuk display
        stok = bahan_data.get('stok_bahan', '')
        satuan = bahan_data.get('satuan', '')
        harga_beli = bahan_data.get('harga_beli', '')
        min_stok = bahan_data.get('min_stok', '')
        
        # Tanggal dibuat dan terakhir update
        tanggal_dibuat_str = bahan_data.get('tanggal_dibuat', '')
        terakhir_update_str = bahan_data.get('terakhir_update', '')
        
        if not terakhir_update_str:
            terakhir_update = datetime.now()
            terakhir_update_str = terakhir_update.strftime('%Y-%m-%d')
        else:
            try:
                terakhir_update = datetime.strptime(terakhir_update_str, '%Y-%m-%d')
            except ValueError:
                terakhir_update = datetime.now()
                terakhir_update_str = terakhir_update.strftime('%Y-%m-%d')
        
        # Hitung umur stok dan hari sejak update
        umur_stok_hari = bahan_data.get('umur_stok_hari')
        hari_sejak_update = bahan_data.get('hari_sejak_update')
        
        # Informasi bahan sejenis untuk konteks
        bahan_sejenis = bahan_data.get('bahan_sejenis', [])
        bahan_sejenis_text = ""
        if bahan_sejenis:
            bahan_sejenis_text = "\n📊 BAHAN SEJENIS DALAM KATEGORI YANG SAMA (untuk referensi, tapi {nama_bahan} HARUS memiliki estimasi yang berbeda):\n"
            for bs in bahan_sejenis:
                bahan_sejenis_text += f"- {bs.get('nama', '')}: {bs.get('stok', '')} {bs.get('satuan', '')}\n"
            bahan_sejenis_text += f"\n⚠️ PENTING: Meskipun ada bahan sejenis di atas, {nama_bahan} HARUS memiliki estimasi_hari yang berbeda dan spesifik untuk karakteristik {nama_bahan} sendiri!\n"
        
        today = datetime.now()
        today_str = today.strftime('%Y-%m-%d')
        
        # Informasi umur stok
        umur_info = ""
        if umur_stok_hari is not None:
            umur_info += f"\nUmur stok: {umur_stok_hari} hari (sejak dibuat)"
        if hari_sejak_update is not None:
            umur_info += f"\nHari sejak terakhir update: {hari_sejak_update} hari"
        
        retry_note = ""
        if is_retry:
            if 'JSON' in previous_error.upper() or 'parse' in previous_error.lower():
                retry_note = f"\n⚠️ KESALAHAN SEBELUMNYA: {previous_error}\n⚠️ PENTING: Anda HARUS mengembalikan HANYA JSON tanpa teks penjelasan! Format: {{'estimasi_hari': angka, 'reason': 'teks', 'confidence': angka}}\n"
            else:
                retry_note = f"\n⚠️ KESALAHAN SEBELUMNYA: {previous_error}\n⚠️ Pastikan estimasi_hari adalah angka bulat (bukan tanggal), dan estimasi_hari harus sesuai dengan jumlah hari yang disebutkan di reason. Berikan estimasi hari yang realistis berdasarkan jenis bahan dan kategori.\n"
        
        return f"""Anda adalah ahli prediksi masa simpan bahan makanan untuk sistem inventory angkringan.

⚠️ PERINGATAN PENTING SEBELUM MEMULAI:
- Setiap bahan makanan memiliki karakteristik yang BERBEDA
- JANGAN memberikan estimasi_hari yang SAMA untuk semua bahan!
- Analisis karakteristik {nama_bahan} secara SPESIFIK dan BERBEDA dari bahan lain
- Bahan segar (Cabai, Ayam, Sayur) = 1-7 hari
- Bahan pokok (Minyak, Beras, Gula) = 180-365+ hari
- Daging segar (Ayam, Ikan) = 1-3 hari

TUGAS: Prediksi kapan bahan makanan akan expired berdasarkan informasi lengkap berikut.

📋 DATA BAHAN:
Nama: {nama_bahan}
Kategori: {kategori}
Stok saat ini: {stok} {satuan}
Harga beli: Rp {harga_beli:,.0f} (jika tersedia)
Minimum stok: {min_stok} {satuan} (jika tersedia)
{bahan_karakteristik}

📅 INFORMASI TANGGAL:
Tanggal dibuat: {tanggal_dibuat_str if tanggal_dibuat_str else 'Tidak diketahui'}
Terakhir update: {terakhir_update_str}
Tanggal hari ini: {today_str}
{umur_info}

{bahan_sejenis_text}

🎯 PETUNJUK PREDIKSI (WAJIB DIIKUTI):
1. Gunakan tanggal terakhir update ({terakhir_update_str}) sebagai titik awal perhitungan
2. Hitung estimasi hari masa simpan dengan mempertimbangkan SEMUA informasi berikut:
   a. NAMA BAHAN: {nama_bahan} - analisis karakteristik bahan ini
   b. KATEGORI: {kategori} - gunakan pengetahuan tentang kategori ini
   c. UMUR STOK: {umur_stok_hari if umur_stok_hari is not None else 'Tidak diketahui'} hari sejak dibuat
   d. HARI SEJAK UPDATE: {hari_sejak_update if hari_sejak_update is not None else 'Tidak diketahui'} hari
   e. BAHAN SEJENIS: Gunakan sebagai referensi untuk memahami pola kategori ini
   f. STOK SAAT INI: {stok} {satuan} - pertimbangkan apakah stok besar/kecil mempengaruhi masa simpan
3. ESTIMASI HARUS REALISTIS berdasarkan jenis bahan - WAJIB BEDA UNTUK SETIAP BAHAN:
   ⚠️ PENTING: Setiap bahan HARUS memiliki estimasi yang BERBEDA! JANGAN memberikan estimasi yang sama!
   
   Contoh karakteristik dan estimasi yang BENAR:
   - CABAI (bahan segar, sayuran): 3-7 hari (karena mudah busuk, kandungan air tinggi)
   - AYAM (daging segar): 1-3 hari (harus disimpan dingin, sangat mudah busuk)
   - MINYAK GORENG (bahan pokok, minyak): 180-365 hari (tahan lama, tidak mudah rusak)
   - BERAS (bahan pokok, kering): 365-730 hari (sangat tahan lama jika disimpan kering)
   - GULA (bahan pokok, kering): 365-730 hari (sangat tahan lama)
   - GARAM (bahan pokok, kering): 730+ hari (hampir tidak pernah expired)
   - SAYUR HIJAU (bahan segar): 2-5 hari (sangat mudah busuk)
   - IKAN SEGAR (bahan segar): 1-2 hari (sangat mudah busuk)
   - BUAH SEGAR (bahan segar): 3-7 hari (tergantung jenis buah)
   - BUMBU KERING (bahan kering): 90-180 hari (tahan lebih lama dari segar)
   - MIE INSTAN (bahan kering, kemasan): 180-365 hari (tahan lama karena kemasan)
   
   ⚠️ KARAKTERISTIK BAHAN YANG HARUS DIPERTIMBANGKAN:
   a. Bahan SEGAR (sayur, daging, ikan, buah segar): 1-7 hari
      - Mudah busuk, kandungan air tinggi
      - Perlu penyimpanan dingin
      - Contoh: Cabai, Ayam, Ikan, Sayur hijau, Buah segar
   b. Bahan POKOK (beras, gula, garam, minyak goreng): 180-365+ hari
      - Tahan lama, tidak mudah rusak
      - Disimpan di tempat kering
      - Contoh: Minyak goreng, Beras, Gula, Garam
   c. Bahan KERING/AWET (kacang, bumbu kering, mie instan): 90-365+ hari
      - Lebih tahan dari bahan segar
      - Perlu tempat kering
      - Contoh: Bumbu kering, Kacang, Mie instan
   d. Bahan BEKU/DINGIN (jika disimpan di freezer/kulkas): 30-180 hari
      - Tahan lebih lama karena suhu dingin
      - Contoh: Daging beku, Ikan beku
   e. Bahan KALENG/PRESERVATIF: 365-730+ hari
      - Sangat tahan lama karena pengawet
      - Contoh: Makanan kaleng
   
4. expired_date = {terakhir_update_str} + estimasi_hari
5. expired_date WAJIB lebih besar dari {terakhir_update_str} (minimal +1 hari, idealnya sesuai jenis bahan)
6. ⚠️ WAJIB: Setiap bahan HARUS memiliki estimasi_hari yang BERBEDA!
   - JANGAN memberikan semua bahan dengan estimasi_hari yang sama (misalnya semua 15 hari)!
   - Analisis karakteristik {nama_bahan} secara spesifik
   - Bandingkan dengan bahan sejenis jika ada, tapi tetap berikan estimasi yang berbeda untuk {nama_bahan}
   - Jika {nama_bahan} adalah bahan segar, berikan estimasi 1-7 hari
   - Jika {nama_bahan} adalah bahan pokok seperti minyak, berikan estimasi 180-365 hari
   - Jika {nama_bahan} adalah daging segar, berikan estimasi 1-3 hari
7. Confidence: skala 1-100, berikan nilai yang wajar:
   - 85-95: Untuk prediksi yang sangat yakin (bahan dengan karakteristik jelas)
   - 70-84: Untuk prediksi yang cukup yakin
   - 50-69: Untuk prediksi yang kurang yakin (hindari jika mungkin)
8. Reason: Jelaskan dengan JELAS dan SPESIFIK mengapa estimasi tersebut diberikan:
   ⚠️ PENTING: FOKUS HANYA PADA BAHAN {nama_bahan} SAJA! JANGAN menyebutkan bahan lain!
   - WAJIB sebutkan jumlah HARI yang diprediksi dalam reason (contoh: "5 hari", "7 hari", "180 hari", "365 hari")
   - FOKUS pada karakteristik {nama_bahan} yang mempengaruhi prediksi
   - Jelaskan bagaimana kategori {kategori} mempengaruhi masa simpan {nama_bahan}
   - Jika ada informasi umur stok, sebutkan bagaimana itu mempengaruhi prediksi {nama_bahan}
   - JANGAN menyebutkan bahan lain dalam deskripsi!
   - WAJIB menjelaskan karakteristik spesifik {nama_bahan}:
     * Jika {nama_bahan} adalah bahan segar (seperti Cabai, Ayam, Sayur): jelaskan kandungan air, mudah busuk, perlu penyimpanan dingin
     * Jika {nama_bahan} adalah bahan pokok (seperti Minyak, Beras, Gula): jelaskan tahan lama, tidak mudah rusak, disimpan kering
     * Jika {nama_bahan} adalah daging segar: jelaskan sangat mudah busuk, perlu suhu dingin, maksimal 1-3 hari
   - Contoh BAIK untuk CABAI: "Cabai adalah bahan segar dengan kandungan air tinggi yang mudah busuk. Cabai dapat bertahan sekitar 5-7 hari jika disimpan di tempat yang sejuk dan kering. Karena sifatnya yang mudah busuk, masa simpan Cabai relatif pendek."
   - Contoh BAIK untuk MINYAK: "Minyak goreng adalah bahan pokok yang tahan lama karena tidak mengandung air dan memiliki sifat pengawet alami. Minyak dapat bertahan sekitar 180-365 hari jika disimpan di tempat yang sejuk, kering, dan terhindar dari cahaya langsung."
   - Contoh BAIK untuk AYAM: "Ayam adalah daging segar yang sangat mudah busuk karena kandungan protein dan air yang tinggi. Ayam dapat bertahan sekitar 1-3 hari jika disimpan di kulkas dengan suhu dingin. Setelah 3 hari, ayam berisiko tinggi mengalami pembusukan."
   - Contoh SALAH: "{nama_bahan} dapat bertahan beberapa hari. Cabai dan minyak juga memiliki masa simpan yang berbeda." (JANGAN menyebutkan bahan lain!)

9. KONSISTENSI WAJIB: 
   ⚠️ PENTING SEKALI - expired_date HARUS SESUAI dengan jumlah hari yang disebutkan di reason!
   - Jika reason mengatakan "16 hari", maka expired_date = {terakhir_update_str} + 16 hari
   - Jika reason mengatakan "30 hari", maka expired_date = {terakhir_update_str} + 30 hari
   - Jika reason mengatakan "365 hari", maka expired_date = {terakhir_update_str} + 365 hari
   - JANGAN membuat expired_date yang tidak sesuai dengan estimasi hari di reason!

📤 OUTPUT (WAJIB format JSON - HANYA JSON, TIDAK ADA TEKS LAIN):
⚠️ PENTING: Anda HARUS mengembalikan HANYA JSON, tanpa teks penjelasan sebelum atau sesudahnya!
⚠️ JANGAN menambahkan markdown, penjelasan, atau teks lain di luar JSON!

Format JSON yang WAJIB dikembalikan:
{{
  "estimasi_hari": angka_hari,
  "reason": "Penjelasan yang WAJIB menyebutkan jumlah hari (contoh: 'dapat bertahan 16 hari' atau 'masa simpan 30 hari').",
  "confidence": angka_antara_1_100
}}

Contoh output yang BENAR (copy paste format ini):
{{"estimasi_hari": 3, "reason": "Ayam adalah daging segar yang sangat mudah busuk. Ayam dapat bertahan sekitar 3 hari jika disimpan di kulkas dengan suhu dingin.", "confidence": 90}}

Contoh output yang SALAH (JANGAN lakukan ini):
Oke, mari kita lakukan prediksi...
{{"estimasi_hari": 3, ...}}
Terima kasih.

⚠️ KEMBALIKAN HANYA JSON, TANPA TEKS LAIN!

⚠️ PENTING SEKALI - BACA INI DENGAN HATI-HATI:
1. JANGAN berikan expired_date dalam format tanggal seperti "YYYY-MM-DD"!
2. Berikan HANYA estimasi_hari (angka bulat) - contoh: 16, 30, 365
3. Sistem akan menghitung expired_date = {terakhir_update_str} + estimasi_hari
4. Jika Anda memberikan expired_date, sistem akan MENGABAIKANNYA dan menggunakan estimasi_hari
5. estimasi_hari HARUS sesuai dengan jumlah hari yang disebutkan di reason
   - Jika reason mengatakan "16 hari", maka estimasi_hari = 16
   - Jika reason mengatakan "30 hari", maka estimasi_hari = 30
   - Jika reason mengatakan "365 hari", maka estimasi_hari = 365
6. JANGAN memberikan format seperti "2025-12-15 + 16 hari" - itu SALAH!
7. Berikan HANYA angka: estimasi_hari = 16

{retry_note}

⚠️ PENTING: 
- Berikan HANYA estimasi_hari (angka), BUKAN expired_date (tanggal)!
- estimasi_hari HARUS sesuai dengan jumlah hari yang disebutkan di reason
- Jika reason mengatakan "X hari", maka estimasi_hari = X
- Sistem akan menghitung expired_date = {terakhir_update_str} + estimasi_hari
- Berikan estimasi yang masuk akal berdasarkan jenis bahan
- ⚠️ WAJIB: JANGAN memberikan semua bahan dengan durasi yang sama!
  * Setiap bahan HARUS memiliki estimasi_hari yang BERBEDA
  * Analisis karakteristik {nama_bahan} secara spesifik
  * Bahan segar (Cabai, Ayam, Sayur): 1-7 hari
  * Bahan pokok (Minyak, Beras, Gula): 180-365+ hari
  * Daging segar (Ayam, Ikan): 1-3 hari
- Gunakan informasi umur stok dan bahan sejenis sebagai referensi tambahan
- Jika Anda memberikan estimasi yang sama untuk semua bahan, itu SALAH! Setiap bahan punya karakteristik berbeda!
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
            terakhir_update_str = bahan_data.get('terakhir_update', '')
            if terakhir_update_str:
                try:
                    terakhir_update = datetime.strptime(terakhir_update_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0)
                except ValueError:
                    terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            else:
                terakhir_update = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
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
                    print(f"[PARSING] WARNING: Inconsistency detected!")
                    print(f"[PARSING] Reason menyebutkan: {reason_days} hari")
                    print(f"[PARSING] estimasi_hari menunjukkan: {ai_days} hari")
                    print(f"[PARSING] Selisih: {diff} hari")
                    print(f"[PARSING] Memperbaiki estimasi_hari sesuai dengan reason...")
                    
                    # Perbaiki estimasi_hari sesuai dengan reason
                    ai_days = reason_days
                    expired_date = terakhir_update + timedelta(days=ai_days)
                    ai_date = expired_date.strftime('%Y-%m-%d')
                    
                    print(f"[PARSING] estimasi_hari diperbaiki menjadi: {ai_days} hari")
                    print(f"[PARSING] expired_date diperbaiki menjadi: {ai_date}")
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