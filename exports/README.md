# Exports — Downloadable Document Bundles

Auto-generated from the Markdown source files (`tools/build_exports.py`).

| File | Format | Contents |
|------|--------|----------|
| `Knowledge-Vault-Complete.pdf` | PDF (~127 pp) | Every topic, all 10 domains, in one document |
| `Knowledge-Vault-Complete.docx` | Word | Same content, editable, with heading styles |
| `Knowledge-Vault-Overview.pptx` | PowerPoint (73 slides) | Title + per-domain dividers + one overview slide per topic |

**Download:** click a file on GitHub, then the **Download** (raw) button. Or grab the whole repo via **Code → Download ZIP**.

To regenerate after editing the Markdown:
```bash
pip install --user markdown python-docx python-pptx fpdf2
python3 tools/build_exports.py
```
