from __future__ import annotations

import re
import urllib.request
from pathlib import Path

from PIL import Image
from pypdf import PdfReader
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "brand"
DOCS_DIR = ROOT / "docs"
SOURCE_URL = "https://milestone.tech/wp-content/smush-webp/2023/11/Brand-Symbolism-NEW.jpg.webp"

PDF_JOBS = {
    "resume.html": ("Russell-Dudek-Milestone-Resume.pdf", 2),
    "cover-letter.html": ("Russell-Dudek-Milestone-Cover-Letter.pdf", 1),
    "interview-brief.html": ("Russell-Dudek-Milestone-Interview-Brief.pdf", 3),
    "90-day-plan.html": ("Russell-Dudek-Milestone-90-Day-Plan.pdf", 3),
    "objection-analysis.html": ("Russell-Dudek-Milestone-Objection-Analysis.pdf", 2),
    "portfolio-review.html": ("Russell-Dudek-Milestone-Portfolio-Review.pdf", 1),
}

FORBIDDEN_PATTERNS = [
    re.compile(r"role\s*[- ]?forge", re.IGNORECASE),
    re.compile(r"public repository", re.IGNORECASE),
    re.compile(r"github\.com/russelldudek/milestone", re.IGNORECASE),
]


def make_white_transparent(image: Image.Image, threshold: int = 246) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
            else:
                pixels[x, y] = (r, g, b, a)
    return rgba


def build_brand_assets() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    source_path = BRAND_DIR / "milestone-brand-symbolism.webp"
    urllib.request.urlretrieve(SOURCE_URL, source_path)

    source = Image.open(source_path).convert("RGB")
    if source.size != (1932, 1592):
        raise RuntimeError(f"Unexpected official brand image size: {source.size}")

    icon = source.crop((300, 0, 680, 212))
    wordmark = source.crop((1080, 5, 1880, 217))

    make_white_transparent(icon).save(BRAND_DIR / "milestone-icon.png", optimize=True)
    make_white_transparent(wordmark).save(BRAND_DIR / "milestone-wordmark.png", optimize=True)


def build_pdfs() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for html_name, (pdf_name, expected_pages) in PDF_JOBS.items():
        source = ROOT / html_name
        output = DOCS_DIR / pdf_name
        HTML(filename=str(source), base_url=str(ROOT)).write_pdf(str(output))
        reader = PdfReader(str(output))
        actual_pages = len(reader.pages)
        if actual_pages != expected_pages:
            raise RuntimeError(
                f"{pdf_name}: expected {expected_pages} pages, got {actual_pages}"
            )
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        for pattern in FORBIDDEN_PATTERNS:
            if pattern.search(text):
                raise RuntimeError(f"Forbidden candidate-facing text in {pdf_name}: {pattern.pattern}")


def validate_manifest() -> None:
    required = [
        ROOT / "index.html",
        ROOT / "resume.html",
        ROOT / "cover-letter.html",
        ROOT / "interview-brief.html",
        ROOT / "90-day-plan.html",
        ROOT / "objection-analysis.html",
        ROOT / "portfolio-review.html",
        ROOT / "styles.css",
        ROOT / "brand-tokens.css",
        ROOT / "app.js",
        ROOT / "brand-intelligence.md",
        BRAND_DIR / "milestone-brand-symbolism.webp",
        BRAND_DIR / "milestone-icon.png",
        BRAND_DIR / "milestone-wordmark.png",
    ]
    required.extend(DOCS_DIR / value[0] for value in PDF_JOBS.values())
    missing = [str(path.relative_to(ROOT)) for path in required if not path.exists() or path.stat().st_size == 0]
    if missing:
        raise RuntimeError(f"Missing or empty campaign artifacts: {missing}")


if __name__ == "__main__":
    build_brand_assets()
    build_pdfs()
    validate_manifest()
    print("Generated and validated Milestone brand assets and PDFs.")
