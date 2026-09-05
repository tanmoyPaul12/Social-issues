"""
Validation Tests: Unit test suite for deterministic 3-state text, photo, video, document, and location validators.
"""
import unittest
from app.validation.location_validator import validate_location_data
from app.validation.text_validator import validate_challenge_text
from app.validation.image_validator import validate_photo_bytes
from app.validation.video_validator import validate_video_metadata
from app.validation.document_validator import validate_document_bytes
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.enums import PriorityLevel
from app.validation.orchestrator import orchestrate_validation

class TestDeterministicValidation(unittest.TestCase):
    
    def test_text_validation_pass(self):
        res = validate_challenge_text("Broken Handpump", "The primary handpump in Namkum village has not worked for three months.")
        self.assertEqual(res["status"], "PASS")
        self.assertGreaterEqual(res["quality"], 0.9)

    def test_text_validation_reject_empty(self):
        res = validate_challenge_text("", "")
        self.assertEqual(res["status"], "REJECT")

    def test_text_validation_reject_spam(self):
        res = validate_challenge_text("Test Issue", "asdfghjk asdfghjk test12345 fake issue lorem ipsum")
        self.assertEqual(res["status"], "REJECT")

    def test_location_consistent(self):
        # Ranchi coordinates (23.3441° N, 85.3096° E)
        res = validate_location_data(23.3441, 85.3096, "Ranchi", "Kanke")
        self.assertEqual(res["status"], "CONSISTENT")
        self.assertTrue(res["is_inside_jharkhand"])

    def test_location_mismatch(self):
        # Ranchi coordinates submitted for Bokaro district
        res = validate_location_data(23.3441, 85.3096, "Bokaro", "Chas")
        self.assertEqual(res["status"], "MISMATCH")
        self.assertTrue(res["is_inside_jharkhand"])

    def test_location_out_of_bounds(self):
        # Mumbai coordinates (19.0760° N, 72.8777° E)
        res = validate_location_data(19.0760, 72.8777, "Ranchi", "Kanke")
        self.assertEqual(res["status"], "REJECT")
        self.assertFalse(res["is_inside_jharkhand"])

    def test_orchestrator_pass(self):
        challenge = ChallengeInput(
            challenge_id="CH-VAL-001",
            title="Broken Check-Dam Sluice Gate",
            description="The check-dam sluice gate in Kanke block is damaged leading to excessive agricultural runoff.",
            district="Ranchi",
            block="Kanke",
            latitude=23.3441,
            longitude=85.3096,
            reported_priority=PriorityLevel.HIGH,
            affected_population=2500
        )
        res = orchestrate_validation(challenge)
        self.assertEqual(res["overall_status"], "PASS")

    def test_orchestrator_file_bytes_image(self):
        from app.validation.orchestrator import orchestrate_validation_with_file_bytes
        import io
        from PIL import Image, ImageDraw
        import random

        # Create image with high-contrast sharp noise/edges
        img = Image.new("RGB", (400, 400), color="white")
        draw = ImageDraw.Draw(img)
        for i in range(0, 400, 10):
            draw.line([(i, 0), (400 - i, 400)], fill="black", width=2)
        
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG")
        raw_bytes = img_byte_arr.getvalue()

        res = orchestrate_validation_with_file_bytes(
            title="Broken Check-Dam Sluice Gate",
            description="The check-dam sluice gate in Kanke block is damaged leading to excessive agricultural runoff.",
            district="Ranchi",
            block="Kanke",
            latitude=23.3441,
            longitude=85.3096,
            file_bytes=raw_bytes,
            file_name="road.jpg",
            content_type="image/jpeg"
        )
        self.assertEqual(res["overall_status"], "PASS")
        self.assertEqual(res["photo"]["status"], "PASS")

if __name__ == "__main__":
    unittest.main()
