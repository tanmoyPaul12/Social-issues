"""
Unit tests for app.preprocessing.text.text_cleaner.
"""
from app.preprocessing.text.text_cleaner import clean_text


def test_unicode_nfkc_normalization():
    # Fullwidth characters normalized to standard ASCII/Unicode
    raw = "Ｈｅｌｌｏ　Ｗｏｒｌｄ"
    assert clean_text(raw) == "Hello World"


def test_zero_width_character_removal():
    # Zero-width spaces embedded in Hindi text
    raw = "पानी\u200b कि\u200c समस्या\ufeff"
    assert clean_text(raw) == "पानी कि समस्या"


def test_whitespace_and_newline_collapse():
    raw = "    हमारे   गांव    में  \n\n\n\n\n  पानी   नहीं   आ रहा है।   "
    expected = "हमारे गांव में\n\nपानी नहीं आ रहा है।"
    assert clean_text(raw) == expected


def test_preserves_numbers_and_punctuation():
    raw = "पिछले 10 दिनों से Ward 4 में handpump #3 बंद है! (Urgent: 500+ affected)"
    assert clean_text(raw) == raw


def test_empty_or_whitespace_input():
    assert clean_text("") == ""
    assert clean_text("   \n\t  ") == ""
