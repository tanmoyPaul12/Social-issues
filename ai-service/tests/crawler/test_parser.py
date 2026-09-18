"""
Unit tests for Academic Semantic Parser Module.
"""
from app.infrastructure.crawler.parser import extract_semantic_content, ParsedPage


def test_extract_semantic_content_html():
    """Verify semantic text, title, headings, and links are extracted correctly."""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Department of Mining Engineering - IIT (ISM) Dhanbad</title>
        <meta name="description" content="Center of excellence in mine safety and excavation technologies.">
    </head>
    <body>
        <nav><a href="/home">Home</a></nav>
        <h1>Department of Mining Engineering</h1>
        <p>The department leads research in underground rock mechanics, slope stability, and heavy mine equipment.</p>
        <h2>Faculty & Laboratories</h2>
        <ul>
            <li><a href="/faculty/dr-verma">Dr. A. Verma - Rock Mechanics</a></li>
            <li><a href="https://iitism.ac.in/labs/mine-ventilation">Mine Ventilation Lab</a></li>
        </ul>
        <footer>Copyright 2026 IIT ISM</footer>
    </body>
    </html>
    """

    parsed = extract_semantic_content(html, base_url="https://iitism.ac.in/dept/mining")

    assert isinstance(parsed, ParsedPage)
    assert "Mining Engineering" in parsed.title
    assert parsed.meta_description == "Center of excellence in mine safety and excavation technologies."
    assert "rock mechanics" in parsed.clean_markdown.lower()
    
    # Headings
    assert any("Mining Engineering" in h for h in parsed.headings)
    
    # Link resolution
    assert "https://iitism.ac.in/faculty/dr-verma" in parsed.extracted_links
    assert "https://iitism.ac.in/labs/mine-ventilation" in parsed.extracted_links


def test_extract_semantic_content_empty_or_invalid():
    """Verify empty string or None produces empty ParsedPage gracefully."""
    parsed_empty = extract_semantic_content("", base_url="https://example.com")
    assert parsed_empty.title == ""
    assert parsed_empty.clean_markdown == ""
    assert parsed_empty.extracted_links == []
