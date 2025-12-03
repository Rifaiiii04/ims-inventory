import importlib
from unittest.mock import patch

import python_ocr_service.ocr_service_hybrid as service


def test_generic_cleanup_normalizes_common_noise():
    text = "1 K9 SemangKo RR - 1-50d"
    cleaned = service.generic_cleanup(text)
    assert "Kg" in cleaned
    assert "RR" in cleaned  # still present before stripping


def test_extract_harga_from_text_handles_formats():
    assert service.extract_harga_from_text("Rp 12.000") == 12000
    assert service.extract_harga_from_text("1-50d") == 15000
    assert service.extract_harga_from_text("20-0uv") == 20000


def test_match_product_to_catalog_prefers_closest():
    service.PRODUCT_CATALOG = ["Semangka", "Melon", "Nangka"]
    results = service.match_product_to_catalog("Semangko")
    assert results
    assert results[0]['name'] == "Semangka"


def test_llm_select_candidate_returns_index_and_counts():
    candidates = [{'name': 'Semangka', 'score': 92.0}, {'name': 'Nangka', 'score': 85.0}]
    llm_state = {'count': 0}
    with patch('python_ocr_service.ocr_service_hybrid.call_ollama_api', return_value='2'):
        idx = service.llm_select_candidate("1 Kg Semangko", candidates, llm_state)
    assert idx == 1
    assert llm_state['count'] == 1

