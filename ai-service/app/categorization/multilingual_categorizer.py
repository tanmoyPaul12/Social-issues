"""
Multilingual Domain Categorizer Engine.
Categorizes citizen problem statements into the official 10 Jharkhand Research Domain sectors
supporting English, Hindi (Devanagari & Hinglish), Bengali (Bengali script & Benglish), and Santali.
"""
import re
from typing import Dict, Any, List, Tuple
from app.categorization.category_definitions import OFFICIAL_DOMAINS

# Multilingual Keyword Lexicon Matrix for Domain Categories
DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "WATER": [
        "water", "pani", "paani", "handpump", "well", "drinking water", "tap",
        "পানি", "জল", "জলের", "পানীয়", "খাল", "নদী", "টিউবওয়েল",
        "पानी", "जल", "पेयजल", "हैंडपंप", "कुआं", "नल", "नदी", "तालाब",
        "da", "dak", "dha"
    ],
    "HEALTH": [
        "health", "hospital", "doctor", "medicine", "fever", "disease", "outbreak", "clinic",
        "হাসপাতাল", "ডাক্তার", "ওষুধ", "রোগ", "চিকিৎসা", "স্বাস্থ্য",
        "अस्पताल", "डॉक्टर", "दवा", "बीमारी", "स्वास्थ्य", "इलाज", "मरीज",
        "rua", "ran"
    ],
    "INFRASTRUCTURE": [
        "road", "bridge", "pothole", "transport", "construction", "street", "highway",
        "রাস্তা", "সেতু", "কালভার্ট", "যোগাযোগ", "পরিবহন",
        "सड़क", "पुल", "सड़कें", "खराब सड़क", "गड्ढे", "रास्ता", "यातायात",
        "horo", "kulhi"
    ],
    "ELECTRICITY": [
        "electricity", "power", "light", "transformer", "voltage", "current", "wire",
        "বিদ্যুৎ", "আলো", "ট্রান্সফরমার", "কারেন্ট",
        "बिजली", "लाइट", "ट्रांसफॉर्मर", "वोल्टेज", "तार", "पावर",
        "bathi"
    ],
    "EDUCATION": [
        "school", "teacher", "education", "student", "college", "book", "building",
        "স্কুল", "শিক্ষক", "শিক্ষা", "ছাত্র", "কলেজ", "বই",
        "स्कूल", "शिक्षक", "शिक्षा", "छात्र", "विद्यालय", "किताब", "पढ़ाई",
        "itun", "asra"
    ],
    "AGRICULTURE": [
        "farmer", "crop", "agriculture", "fertilizer", "seed", "drought", "farming",
        "কৃষি", "কৃষক", "ফসল", "সার", "বীজ", "খরা", "জমি",
        "किसान", "फसल", "कृषि", "खाद", "बीज", "सूखा", "खेती", "जमीन",
        "khet", "hasa"
    ],
    "SANITATION": [
        "waste", "garbage", "drain", "toilet", "drainage", "sanitation", "cleanliness",
        "বর্জ্য", "আবর্জনা", "ড্রেন", "শৌচাগার", "পয়ঃনিষ্কাশন",
        "कचरा", "गंदगी", "नाली", "शौचालय", "सफाई", "दूषित",
        "sohrai"
    ],
    "LIVELIHOOD": [
        "job", "employment", "mgnrega", "wages", "poverty", "work", "salary",
        "কাজ", "চাকরি", "কর্মসংস্থান", "মজুরি", "গরিব",
        "रोजगार", "मनरेगा", "मजदूरी", "काम", "नौकरी", "गरीबी",
        "kami"
    ],
    "ENVIRONMENT": [
        "tree", "forest", "pollution", "climate", "flood", "soil", "mining",
        "গাছ", "বন", "দূষণ", "বন্যা", "জলবায়ু",
        "पेड़", "जंगल", "वन", "प्रदूषण", "बाढ़", "जलवायु", "पर्यावरण",
        "bir", "dare"
    ],
    "GOVERNANCE": [
        "ration", "bribe", "corruption", "pension", "certificate", "scheme", "office",
        "রেশন", "ঘুষ", "দুর্নীতি", "পেনশন", "সার্টিফিকেট", "অফিস",
        "राशन", "घूस", "भ्रष्टाचार", "पेंशन", "प्रमाणपत्र", "योजना", "कार्यालय",
        "sarkar"
    ]
}


class MultilingualDomainCategorizer:
    """
    Categorizes text inputs into official research domains using multilingual keyword affinity scoring.
    """

    def classify_text(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "primary_category": "GOVERNANCE",
                "category_name": OFFICIAL_DOMAINS["GOVERNANCE"],
                "confidence": 0.50,
                "scores": {}
            }

        text_lower = text.lower()
        scores: Dict[str, float] = {domain: 0.0 for domain in OFFICIAL_DOMAINS}

        # Calculate keyword match frequency
        for domain, keywords in DOMAIN_KEYWORDS.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw.lower()) + r'\b', text_lower):
                    scores[domain] += 1.0
                elif kw.lower() in text_lower:
                    scores[domain] += 0.5

        # Find max domain
        max_score = max(scores.values())
        if max_score == 0:
            return {
                "primary_category": "GOVERNANCE",
                "category_name": OFFICIAL_DOMAINS["GOVERNANCE"],
                "confidence": 0.55,
                "scores": scores
            }

        best_domain = max(scores, key=scores.get)
        confidence = round(min(0.65 + (max_score * 0.10), 0.98), 2)

        return {
            "primary_category": best_domain,
            "category_name": OFFICIAL_DOMAINS.get(best_domain, best_domain),
            "confidence": confidence,
            "scores": scores
        }


# Global instance
multilingual_categorizer = MultilingualDomainCategorizer()
