from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
index = (ROOT / "index.html").read_text(encoding="utf-8")
asset = ROOT / "assets" / "brand" / "milestone-wordmark-compact.png"
masthead_path = ROOT / "masthead.css"

assert asset.exists() and asset.stat().st_size > 0, "missing compact Milestone logo asset"
assert masthead_path.exists(), "missing dedicated masthead stylesheet"
masthead = masthead_path.read_text(encoding="utf-8")

header_match = re.search(r'<header class="site-header">.*?</header>', index, re.S)
assert header_match, "missing site header"
header = header_match.group(0)

assert header.count('class="brand-lockup"') == 1, "header must contain one employer lockup"
assert 'assets/brand/milestone-wordmark-compact.png' in header, "header must use compact logo asset"
assert 'Independent candidate vision · Russell Dudek' in header, "missing independent-candidate qualifier"
assert 'Program Manager, AI Transformation Office' not in header, "role title must remain in hero, not masthead"
for label in ("Mandate", "Protocol", "Evidence", "First 90 Days", "Documents"):
    assert f">{label}<" in header, f"missing navigation label: {label}"

assert '<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="masthead.css">' in index, "masthead stylesheet must load after shared styles"
compact = masthead.replace(" ", "").replace("\n", "")
assert '.site-header .brand-pair::after' in masthead and 'content:none' in compact, "masthead must disable typed pseudo-wordmark"
assert 'white-space:nowrap' in compact, "navigation labels must be protected from wrapping"
assert '@media(max-width:900px)' in compact, "missing mobile-menu breakpoint"

print("masthead source contract passed")
