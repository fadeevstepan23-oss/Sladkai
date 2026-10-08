"""Убирает из PDF красные пунктирные плашки-пометки («Черновик — …», «Проверить …»).

python3 clean_pdf.py in.pdf out.pdf fonts_dir
Плашка = группа тонких красных заливок, образующих рамку. Удаляются рамка и текст внутри;
если справа от плашки в той же строке стоит обычный текст, он сдвигается к левому полю.
"""
import sys
import pymupdf

SRC, OUT, FONTS = sys.argv[1:4]
ACC = (0.5412, 0.1647, 0.2275)
PINK = (0.851, 0.604, 0.647)
LEFT = 105.0


def close(c, t, e=0.03):
    return c is not None and all(abs(a - b) < e for a, b in zip(c, t))


doc = pymupdf.open(SRC)
for pno, page in enumerate(doc, 1):
    marks = [dr["rect"] for dr in page.get_drawings()
             if (close(dr.get("fill"), ACC) or close(dr.get("fill"), PINK))
             and min(dr["rect"].width, dr["rect"].height) < 1.5 and len(dr["items"]) >= 18]
    # кластеры связанных линий; рамка = минимум 3 линии
    clusters = []
    for r in marks:
        hit = [c for c in clusters if (c["rect"] + (-2, -2, 2, 2)).intersects(r)]
        merged = dict(rect=pymupdf.Rect(r), n=1)
        for c in hit:
            merged["rect"] |= c["rect"]
            merged["n"] += c["n"]
            clusters.remove(c)
        clusters.append(merged)
    tags = [c["rect"] for c in clusters if c["n"] >= 3]
    if not tags:
        continue

    raw = page.get_text("rawdict")
    shifts = []  # (line, dx)
    for tag in tags:
        zone = tag + (-3, -3, 3, 3)
        for b in raw["blocks"]:
            if b["type"] != 0:
                continue
            for ln in b["lines"]:
                x0, y0, x1, y1 = ln["bbox"]
                if abs((y0 + y1) / 2 - (tag.y0 + tag.y1) / 2) > 12:
                    continue
                if x0 >= tag.x1 + 3 and abs(x0 - tag.x1) < 60:
                    # обычный текст справа от плашки — сдвинем к левому краю плашки
                    shifts.append((ln, x0 - tag.x0))

    # стираем плашки: текст внутри и сама рамка
    for tag in tags:
        page.add_redact_annot(tag + (-2, -2, 2, 2), fill=False)
    for ln, _ in shifts:
        page.add_redact_annot(pymupdf.Rect(ln["bbox"]) + (0.5, 0.5, -0.5, -0.5), fill=False)
    page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                          graphics=pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
                          text=pymupdf.PDF_REDACT_TEXT_REMOVE)

    # перерисовываем сдвинутые строки посимвольно: разрядка букв остаётся прежней
    page.insert_font(fontname="jbm", fontfile=f"{FONTS}/JetBrainsMono-Regular.ttf")
    for ln, dx in shifts:
        for sp in ln["spans"]:
            col = sp["color"]
            rgb = ((col >> 16) & 255) / 255, ((col >> 8) & 255) / 255, (col & 255) / 255
            for ch in sp["chars"]:
                if ch["c"].strip():
                    page.insert_text((ch["origin"][0] - dx, ch["origin"][1]), ch["c"],
                                     fontname="jbm", fontsize=sp["size"], color=rgb)
    print(f"p{pno}: плашек {len(tags)}, сдвинуто строк {len(shifts)}")

doc.save(OUT, garbage=3, deflate=True)
print("saved", OUT)
