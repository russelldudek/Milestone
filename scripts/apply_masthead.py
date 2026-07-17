from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
NEW_HEADER = '''<header class="site-header"><div class="header-inner"><a class="brand-lockup" href="index.html" aria-label="Milestone Technologies candidate vision home"><span class="brand-pair"><img class="brand-logo" src="assets/brand/milestone-wordmark-compact.png" alt="Milestone Technologies" width="480" height="127"></span><span class="candidate-label">Independent candidate vision · Russell Dudek</span></a><button class="menu-button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">Menu</button><nav class="site-nav" id="primary-navigation" aria-label="Primary"><a href="#mandate">Mandate</a><a href="#protocol">Protocol</a><a href="#evidence">Evidence</a><a href="#entry">First 90 Days</a><a class="nav-cta" href="#documents">Documents</a></nav></div></header>'''

original = INDEX.read_text(encoding="utf-8")
text = original
if 'href="masthead.css"' not in text:
    text = text.replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="masthead.css">', 1)
updated, count = re.subn(r'<header class="site-header">.*?</header>', NEW_HEADER, text, count=1, flags=re.S)
if count != 1:
    raise RuntimeError(f"Expected one site header, replaced {count}")
if updated != original:
    INDEX.write_text(updated, encoding="utf-8")
    print("Applied executive masthead markup.")
else:
    print("Executive masthead markup already current.")
