#!/usr/bin/env python3
"""Собирает презентацию в один HTML-файл: стили, скрипт, шрифты и фото внутри.

    python3 artem-congress/tools/build.py

Результат — artem-congress/dist/presentation.html. Его можно переслать
в Telegram или по почте и открыть двойным кликом без интернета.
"""
import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".woff2":
        mime = "font/woff2"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_css(css_path: pathlib.Path) -> str:
    css = css_path.read_text(encoding="utf-8")
    return re.sub(
        r"url\((?!data:|#)([^)]+)\)",
        lambda m: f"url({data_uri((css_path.parent / m.group(1).strip('\"')).resolve())})",
        css,
    )


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    html = re.sub(
        r'<link rel="stylesheet" href="([^"]+)">',
        lambda m: "<style>\n" + inline_css(ROOT / m.group(1)) + "\n</style>",
        html,
    )
    html = re.sub(
        r'<script src="([^"]+)"></script>',
        lambda m: "<script>\n" + (ROOT / m.group(1)).read_text(encoding="utf-8") + "\n</script>",
        html,
    )
    html = re.sub(
        r'src="(assets/[^"]+)"',
        lambda m: f'src="{data_uri(ROOT / m.group(1))}"',
        html,
    )

    DIST.mkdir(exist_ok=True)
    out = DIST / "presentation.html"
    out.write_text(html, encoding="utf-8")
    print(f"{out.relative_to(ROOT.parent)} — {out.stat().st_size / 1e6:.1f} МБ")


if __name__ == "__main__":
    main()
