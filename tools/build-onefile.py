#!/usr/bin/env python3
"""Собирает demo.html — одну самодостаточную страницу.

Стили, скрипт и все слоты-картинки встраиваются внутрь файла, поэтому
demo.html можно переслать в мессенджере и открыть двойным кликом:
сервер и интернет не нужны (подгружаются только веб-шрифты, без них
страница спокойно откатывается на системные).

Запуск:  python3 tools/build-onefile.py
"""

import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()


def data_uri(rel):
    with open(os.path.join(ROOT, rel), 'rb') as f:
        blob = base64.b64encode(f.read()).decode('ascii')
    return 'data:image/svg+xml;base64,' + blob


def inline_images(text):
    """Меняет пути assets/img/*.svg на data-URI (и в разметке, и в данных JS)."""
    return re.sub(r'assets/img/([a-z0-9\-]+)\.svg',
                  lambda m: data_uri('assets/img/%s.svg' % m.group(1)),
                  text)


def main():
    html = read('index.html')
    css = read('assets/css/style.css')
    js = read('assets/js/app.js')

    html = html.replace('<link rel="stylesheet" href="assets/css/style.css">',
                        '<style>\n%s\n</style>' % css)
    html = html.replace('<script src="assets/js/app.js"></script>',
                        '<script>\n%s\n</script>' % inline_images(js))
    html = inline_images(html)

    out = os.path.join(ROOT, 'demo.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('demo.html собран: %.0f КБ' % (os.path.getsize(out) / 1024))


if __name__ == '__main__':
    main()
