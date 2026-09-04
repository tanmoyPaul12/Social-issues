"""
Unit tests for app.preprocessing.text.embedding_service.
"""
from app.preprocessing.text.embedding_service import embedding_service


def test_generate_text_embedding_dimensions():
    text = "The primary handpump in Kanke village has not worked for three weeks."
    vec = embedding_service.generate_embedding(text)
    assert isinstance(vec, list)
    assert len(vec) == 384
    assert any(v != 0.0 for v in vec)


def test_embedding_cosine_similarity():
    text1 = "There is no drinking water supply in our village."
    text2 = "No drinking water available in the village pipeline."
    text3 = "Road potholes cause severe traffic accidents on highway."

    vec1 = embedding_service.generate_embedding(text1)
    vec2 = embedding_service.generate_embedding(text2)
    vec3 = embedding_service.generate_embedding(text3)

    sim_1_2 = embedding_service.compute_similarity(vec1, vec2)
    sim_1_3 = embedding_service.compute_similarity(vec1, vec3)

    assert sim_1_2 > sim_1_3  # Water problems should be more similar to each other than to road potholes


def test_empty_text_embedding():
    vec = embedding_service.generate_embedding("")
    assert len(vec) == 384
    assert all(v == 0.0 for v in vec)
