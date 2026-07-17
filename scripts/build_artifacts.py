from __future__ import annotations

import re
from pathlib import Path

from PIL import Image
from pypdf import PdfReader
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "brand"
DOCS_DIR = ROOT / "docs"

PDF_JOBS = {
    "resume.html": ("Russell-Dudek-Milestone-Resume.pdf", 2),
    "cover-letter.html": ("Russell-Dudek-Milestone-Cover-Letter.pdf", 1),
    "interview-brief.html": ("Russell-Dudek-Milestone-Interview-Brief.pdf", 2),
    "90-day-plan.html": ("Russell-Dudek-Milestone-90-Day-Plan.pdf", 2),
    "candidate-advantage.html": ("Russell-Dudek-Milestone-Candidate-Advantage.pdf", 1),
    "portfolio-review.html": ("Russell-Dudek-Milestone-Portfolio-Review.pdf", 1),
}

PRIVATE_PROCESS_PATTERN = "role" + r"\s*[- ]?" + "forge"
SOURCE_INVITATION_PATTERN = "public " + "repository"
CAMPAIGN_SOURCE_PATTERN = "github" + r"\.com/" + "russelldudek/" + "milestone"

FORBIDDEN_PATTERNS = [
    re.compile(PRIVATE_PROCESS_PATTERN, re.IGNORECASE),
    re.compile(SOURCE_INVITATION_PATTERN, re.IGNORECASE),
    re.compile(CAMPAIGN_SOURCE_PATTERN, re.IGNORECASE),
]


def build_brand_assets() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    expected = {
        BRAND_DIR / "milestone-icon.png": (380, 212),
        BRAND_DIR / "milestone-wordmark.png": (800, 212),
    }
    for path, expected_size in expected.items():
        if not path.exists() or path.stat().st_size == 0:
            raise RuntimeError(f"Missing committed brand asset: {path.relative_to(ROOT)}")
        with Image.open(path) as image:
            if image.size != expected_size:
                raise RuntimeError(
                    f"Unexpected brand asset size for {path.name}: {image.size}; expected {expected_size}"
                )


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
        ROOT / "candidate-advantage.html",
        ROOT / "portfolio-review.html",
        ROOT / "styles.css",
        ROOT / "brand-tokens.css",
        ROOT / "revision.css",
        ROOT / "app.js",
        ROOT / "brand-intelligence.md",
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
