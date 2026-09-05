"""
Categorization Tests: Unit test suite for domain classification.
"""
import unittest
from app.categorization.classifier import classify_challenge_domain

class TestCategorization(unittest.TestCase):
    
    def test_water_domain_classification(self):
        res = classify_challenge_domain("Broken Water Pipeline", "The drinking water pipeline in Namkum village is leaking heavily causing severe flooding.")
        self.assertIn("Water", res.primary_category)

    def test_agriculture_domain_classification(self):
        res = classify_challenge_domain("Paddy Crop Pest Infestation", "Farmers in Kanke block are facing severe pest attacks on paddy crops.")
        self.assertIn("Agriculture", res.primary_category)

if __name__ == "__main__":
    unittest.main()
