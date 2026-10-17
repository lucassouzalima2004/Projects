#!/usr/bin/env python3
"""
Importa o catálogo de https://www.oboticario.pt para assets/js/products.js e baixa as fotos.
Não vai para o ar. Precisa de Python 3 com Pillow (pip install pillow).

    python3 amarabotibeauty/tools/importar-oboticario.py

O que faz:
  1. Lista os produtos (coleção "all", página por página, mais o sitemap, que é incompleto) e lê cada
     página de produto (nome, linha, preço, disponibilidade, descrição e fotos).
     As páginas lidas ficam guardadas em --cache para a próxima vez ser rápida (--atualizar lê tudo de novo).
  2. Separa por categoria, tira o tamanho do nome, passa os nomes para o português do Brasil e faz
     a versão em italiano.
  3. Baixa a foto principal de cada produto, corta as sobras de fundo branco e salva em
     assets/img/produtos/<id>.webp, junto com a cor do produto (para o brilho atrás da foto).
  4. Escreve assets/js/products.js. O ESTOQUE e os destaques que já estiverem no products.js são
     mantidos; produto novo entra com ESTOQUE_PADRAO (ou 0 se estiver esgotado no site deles).

Preços: os do oboticario.pt (Portugal), em euro. Ajuste no products.js ou na planilha.
"""
import argparse
import io
import json
import os
import re
import sys
import tempfile
import time
import unicodedata
import urllib.parse
import urllib.request

from PIL import Image, ImageChops

BASE = 'https://www.oboticario.pt'
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
OUT_JS = os.path.join(SITE, 'assets', 'js', 'products.js')
IMG_DIR = os.path.join(SITE, 'assets', 'img', 'produtos')
ESTOQUE_PADRAO = 5
UA = {'User-Agent': 'Mozilla/5.0 (catalogo Amarabotibeauty)', 'Accept-Language': 'pt-PT'}

# Fora da vitrine: outras marcas e o que não é produto
FORA = re.compile(r'australian gold|saco|\bcaixas?\b|envelope|papel de seda|\bla[cç]o\b|cartao|cart[aã]o|gift ?card|embrulho|embalagem|caixa (de )?presente|portes|amostra', re.I)

# Destaques ("Mais amados") e novidades na primeira importação
DESTAQUES = ['lily-eau-parfum-75ml', 'malbec-edt-100ml', 'egeo-dolce-edt-90ml', 'locao-hidratante-nativa-spa-ameixa-negra-400ml',
             'zaad-edp-95ml', 'coffee-woman-seduction-edt-100ml', 'floratta-rose-sucree']
NOVOS = re.compile(r'rose sucr|black legend|liz vanilla|creamy lip tint', re.I)

# Linhas conhecidas, em ordem de prioridade: a primeira que aparecer no nome é a linha do produto
# (a "marca" da página às vezes vem errada, como "Lily" num kit de Malbec)
LINHAS = ['Nativa SPA', 'Cuide-se Bem', 'Quem Disse, Berenice?', 'Make B.', 'Botica 214', 'Privée', 'Lily', 'Malbec',
          'Floratta', 'Egeo', 'Liz', 'Zaad', 'Quasar', 'Coffee', 'Glamour', 'Elysée', 'Her Code', 'Botik', 'Boti Baby',
          'Match.', 'Aura', 'Siàge', 'Arbo', 'Uomini', 'Insensatez', 'Thaty', 'Anni', 'Accordes', 'Club 6', 'Dr. Botica',
          'The Blend', 'Celebre', 'Connexion', 'Clash', 'Sophie', 'Portinari', 'Styletto', 'Next', 'Boticollection']

# Como a "marca" aparece no site deles -> nome da linha na vitrine
ALIAS = {'qdb': 'Quem Disse, Berenice?', 'aura': 'Aura', 'cuide-se bem': 'Cuide-se Bem', 'make b.': 'Make B.', 'match.': 'Match.'}

CATEGORIAS = ['perfumes', 'masculino', 'corpo', 'cabelos', 'rosto', 'make', 'kits', 'acessorios']

MASC = re.compile(r'\b(malbec|zaad|quasar|uomini|arbo|club 6|lord|the blend|men|man|homem|masculin[oa]?|for him|barba|after ?shave|kaiak)\b', re.I)
KITS = re.compile(r'\b(kit|coffret|conjunto|discovery set)\b', re.I)
ACESS = re.compile(r'n[eé]cessaire|copo t[eé]rmico|\bbag\b|esponja de banho|fita de cabelo|garrafa|caneca|chaveiro', re.I)
CORPO = re.compile(r'\bcreme\b|loca|oleo|sabonete|esfoliante|corporal|\bcorpo\b|maos|\bpes\b|pos-sol|desodorante|splash', re.I)
MAKE = re.compile(r'batom|blush|iluminador|m[aá]scara de (pestanas|c[ií]lios)|r[ií]mel|gloss|l[aá]pis|sombra|paleta|\bbase\b|corretor|\bp[oó]\b|primer|delineador|verniz|esmalte|pinc[eé]is|pincel|sobrancelha|lip ?tint|lip|bronzer|contorno|fixador|eyeliner|aplicador|c[ií]lios|glitter', re.I)
CABELO = re.compile(r'champ[oô]|shampoo|condicionador|m[aá]scara capilar|cabelo|capilar|leave.?in|si[aà]ge|finalizador|creme para pentear|[oó]leo de reconstru', re.I)
ROSTO = re.compile(r'facial|rosto|botik|s[eé]rum|olhos|[aá]cido|antissinais|anti.?idade|micelar|t[oó]nico|desmaquilh|protetor solar|fps|hidratante facial|esfoliante facial|m[aá]scara facial|olheiras|vitamina c|niacinamida|retinol|cleanser|limpeza|balm labial|acqua gel', re.I)
PERFUME = re.compile(r'eau de parfum|eau de toil+ett?e|col[oó]nia|perfume|parfum|body splash|\bedt\b|\bedp\b|body mist', re.I)

# Português de Portugal -> do Brasil (nomes e descrições)
BR = [(r'\bDesodorizante\b', 'Desodorante'), (r'\bdesodorizante\b', 'desodorante'), (r'Col[óo]nia', 'Colônia'),
      (r'\bChamp[ôo]\b', 'Shampoo'), (r'\bGel de Duche\b', 'Sabonete Líquido'), (r'\bduche\b', 'banho'),
      (r'\bPestanas\b', 'Cílios'), (r'\bpestanas\b', 'cílios'), (r'\bMaquilhagem\b', 'Maquiagem'), (r'\bmaquilhagem\b', 'maquiagem'),
      (r'Hialur[óo]nico', 'Hialurônico'), (r'T[óo]nico', 'Tônico'), (r'\bVerniz\b', 'Esmalte'), (r'\bverniz\b', 'esmalte'),
      (r'\bEcrã\b', 'Protetor'), (r'[Dd]esmaquilhante', 'Demaquilante'), (r'\bfacto\b', 'fato'), (r'\bcontacto\b', 'contato'), (r'\bactiv', 'ativ'), (r'\bóptim', 'ótim'),
      (r'\bPequeno-almoço\b', 'Café da manhã')]

# Tipo de produto em italiano (o nome da fragrância continua igual). Troca só palavras inteiras.
IT = [('Desodorante Colônia', 'Eau de Cologne'), ('Desodorante', 'Deodorante'), ('Colônia', 'Colonia'),
      ('Loção Hidratante Corporal', 'Lozione Corpo Idratante'), ('Loção Corporal Hidratante', 'Lozione Corpo Idratante'),
      ('Loção Refirmante Corporal', 'Lozione Corpo Rassodante'), ('Loção Hidratante', 'Lozione Idratante'),
      ('Loção Corporal', 'Lozione Corpo'), ('Loção', 'Lozione'), ('Creme Hidratante Acetinado', 'Crema Idratante Vellutata'),
      ('Creme Aveludado Hidratante Corporal', 'Crema Corpo Vellutata Idratante'), ('Creme Hidratante Perfumado', 'Crema Idratante Profumata'),
      ('Creme Hidratante para Mãos', 'Crema Mani Idratante'), ('Creme de Mãos Hidratante', 'Crema Mani Idratante'),
      ('Creme de Mãos', 'Crema Mani'), ('Creme para as Mãos', 'Crema Mani'), ('Creme de Pés', 'Crema Piedi'),
      ('Creme de Banho Acetinado', 'Crema Doccia Vellutata'), ('Creme de Banho', 'Crema Doccia'), ('Creme Esfoliante', 'Crema Esfoliante'),
      ('Creme para Pentear', 'Crema Styling'), ('Creme de Limpeza Facial', 'Crema Detergente Viso'), ('Creme Facial', 'Crema Viso'),
      ('Creme Hidratante', 'Crema Idratante'), ('Gel Creme', 'Gel Crema'), ('Creme', 'Crema'),
      ('Óleo Glorioso de Banho', 'Olio da Bagno Glorioso'), ('Óleo Perfumado Corporal', 'Olio Corpo Profumato'),
      ('Óleo Corporal Hidratante', 'Olio Corpo Idratante'), ('Óleo Hidratante', 'Olio Idratante'), ('Óleo Corporal', 'Olio Corpo'),
      ('Óleo Capilar', 'Olio per Capelli'), ('Óleo para Barba', 'Olio da Barba'), ('Óleo', 'Olio'),
      ('Sabonete Corporal Esfoliante', 'Sapone Corpo Esfoliante'), ('Sabonete Líquido', 'Sapone Liquido'), ('Sabonete', 'Sapone'),
      ('Açúcar Esfoliante', 'Scrub allo Zucchero'), ('Gel de Banho', 'Bagnoschiuma'), ('Condicionador', 'Balsamo'),
      ('Máscara de Hidratação', 'Maschera Idratante'), ('Máscara Capilar', 'Maschera per Capelli'), ('Máscara de Cílios', 'Mascara'),
      ('Máscara Facial', 'Maschera Viso'), ('Máscara Matizadora', 'Maschera Antigiallo'), ('Máscara', 'Maschera'),
      ('Batom Líquido', 'Rossetto Liquido'), ('Batom', 'Rossetto'), ('Lápis de Lábios', 'Matita Labbra'),
      ('Lápis de Olhos', 'Matita Occhi'), ('Lápis Retrátil para Olhos', 'Matita Occhi Retrattile'), ('Lápis', 'Matita'),
      ('Paleta de Sombras', 'Palette Ombretti'), ('Sombra', 'Ombretto'), ('Iluminador Líquido', 'Illuminante Liquido'),
      ('Iluminador em Pó Compacto', 'Illuminante Compatto'), ('Iluminador', 'Illuminante'), ('Blush em Pó Compacto', 'Blush Compatto'),
      ('Blush Líquido', 'Blush Liquido'), ('Blush Compacto', 'Blush Compatto'), ('Pó Compacto', 'Cipria Compatta'),
      ('Pó Solto', 'Cipria in Polvere'), ('Pó Translúcido', 'Cipria Trasparente'), ('Pó', 'Cipria'),
      ('Base Líquida', 'Fondotinta Liquido'), ('Base', 'Fondotinta'), ('Corretor Líquido', 'Correttore Liquido'), ('Corretor', 'Correttore'),
      ('Esmalte', 'Smalto'), ('Pincéis', 'Pennelli'), ('Pincel', 'Pennello'), ('Caneta para Sobrancelhas', 'Penna Sopracciglia'),
      ('Caneta para Sobrancelha', 'Penna Sopracciglia'), ('Sobrancelhas', 'Sopracciglia'), ('Sobrancelha', 'Sopracciglia'),
      ('Gloss Lábios', 'Gloss Labbra'), ('Glitter Líquido', 'Glitter Liquido'), ('Multiusos', 'Multiuso'),
      ('Água Micelar', 'Acqua Micellare'), ('Sérum', 'Siero'), ('Protetor Solar', 'Protezione Solare'),
      ('Ácido Hialurônico', 'Acido Ialuronico'), ('Ácido Glicólico', 'Acido Glicolico'), ('Ácido Poliglutâmico', 'Acido Poliglutammico'),
      ('Ácido Mandélico', 'Acido Mandelico'), ('Ácido', 'Acido'), ('Tônico Capilar', 'Tonico per Capelli'), ('Tônico', 'Tonico'),
      ('Gel de Limpeza Facial', 'Gel Detergente Viso'), ('Gel Limpeza Facial', 'Gel Detergente Viso'),
      ('Geleia Concentrada de Limpeza Facial', 'Gelatina Detergente Viso'), ('Coffret de Natal', 'Cofanetto di Natale'),
      ('Coffret Natal', 'Cofanetto di Natale'), ('Coffret', 'Cofanetto'), ('Kit de Natal', 'Kit di Natale'), ('Kit Natal', 'Kit di Natale'),
      ('de Natal', 'di Natale'), ('Natal', 'Natale'), ('Refil', 'Ricarica'), ('Líquido', 'Liquido'), ('Líquida', 'Liquida'),
      ('Hidratação Intensa', 'Idratazione Intensa'), ('Hidratação', 'Idratazione'), ('Nutrição Profunda', 'Nutrizione Profonda'),
      ('Nutrição', 'Nutrizione'), ('Reconstrução', 'Ricostruzione'), ('Antiqueda', 'Anticaduta'), ('Cachos', 'Ricci'),
      ('Refrescante', 'Rinfrescante'), ('Antissinais', 'Antietà'), ('Alta Potência', 'Alta Potenza'), ('Tripla Ação', 'Tripla Azione'),
      ('Longa Duração', 'Lunga Durata'), ('Alta Pigmentação', 'Alta Pigmentazione'), ('Protetora', 'Protettiva'),
      ('Bifásico', 'Bifasico'), ('Mate', 'Matte'), ('Semi-mate', 'Semi-matte'), ('Veludo', 'Velluto'), ('Cremoso', 'Cremoso'),
      ('Masculino', 'Uomo'), ('Feminino', 'Donna'), ('Corporal', 'Corpo'), ('2 em 1', '2 in 1'), ('4 em 1', '4 in 1'),
      ('para as', 'per le'), ('para', 'per'), ('com', 'con'), ('Mãos', 'Mani'), ('Rosto', 'Viso'), ('Olhos', 'Occhi'),
      ('Lábios', 'Labbra'), ('Cabelo', 'Capelli'), ('Hidratante', 'Idratante'), ('Nutritivo', 'Nutriente'),
      ('Reafirmante', 'Rassodante'), ('Refirmante', 'Rassodante'), ('Firmador', 'Rassodante'), ('Presente', 'Regalo'),
      ('Infantil', 'per Bambini'), ('Unissexo', 'Unisex'), ('Necessaire', 'Pochette'), ('Fita de Cabelo', 'Nastro per Capelli')]

CORES = {'lily': '#EBC3B0', 'malbec': '#5E1B2C', 'floratta': '#F0A7B4', 'liz': '#E9D2A4', 'egeo': '#E8587A', 'zaad': '#2C4766',
         'nativa spa': '#5A2742', 'cuide-se bem': '#F2A783', 'botik': '#BCD5E6', 'aura': '#E6B2A0', 'make b.': '#B9475E'}


def norm(s):
    return unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()


def get(url, binary=False, tries=3):
    for i in range(tries):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
            return data if binary else data.decode('utf-8', 'replace')
        except Exception as e:  # rede instável: tenta de novo
            print('  erro', url, e, file=sys.stderr)
            time.sleep(2 + i * 3)
    return b'' if binary else ''


def list_products():
    """Endereços de todos os produtos: a coleção "all" (paginada por cursor) e o sitemap."""
    handles = []
    cursor = None
    for _ in range(80):
        url = BASE + '/collections/all' + ('?' + urllib.parse.urlencode({'direction': 'next', 'cursor': cursor}) if cursor else '')
        s = get(url)
        new = [h for h in sorted(set(re.findall(r'href="/products/([^"?#]+)"', s))) if h not in handles]
        handles += new
        m = re.search(r'endCursor\\?",\\?"([A-Za-z0-9=+/_-]+)\\?"', s)
        if not new or not m:
            break
        cursor = m.group(1)
        time.sleep(0.4)
    for u in re.findall(r'<loc>https://www\.oboticario\.pt/products/([^<]+)</loc>', get(BASE + '/sitemap.xml')):
        if u not in handles:
            handles.append(u)
    return [f'{BASE}/products/{h}' for h in handles]


def crawl(cache_path, refresh):
    cache = {}
    if os.path.exists(cache_path) and not refresh:
        cache = {p['url']: p for p in json.load(open(cache_path, encoding='utf-8'))}
    urls = list_products()
    print(f'{len(urls)} produtos no site ({len(cache)} já lidos)')
    for i, u in enumerate(urls):
        if u in cache:
            continue
        s = get(u)
        prod = None
        for m in re.finditer(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S):
            try:
                d = json.loads(m.group(1))
            except ValueError:
                continue
            if isinstance(d, dict) and d.get('@type') == 'Product':
                prod = d
        rec = {'url': u, 'handle': u.rsplit('/', 1)[1]}
        if prod:
            off = prod.get('offers') or {}
            if isinstance(off, list):
                off = off[0] if off else {}
            img = prod.get('image')
            rec.update(name=prod.get('name'), brand=(prod.get('brand') or {}).get('name'), desc=prod.get('description'),
                       sku=prod.get('sku'), price=off.get('price'), avail=str(off.get('availability', '')).rsplit('/', 1)[-1],
                       images=img if isinstance(img, list) else [img])
        cache[u] = rec
        if i % 20 == 0:
            print(f'  {i}/{len(urls)} {rec.get("name")}')
            json.dump(list(cache.values()), open(cache_path, 'w', encoding='utf-8'), ensure_ascii=False)
        time.sleep(0.35)
    json.dump(list(cache.values()), open(cache_path, 'w', encoding='utf-8'), ensure_ascii=False)
    return [cache[u] for u in urls if u in cache]


def sub_all(text, rules):
    for a, b in rules:
        text = re.sub(a, b, text)
    return text


def sub_words(text, rules):
    """Troca expressões inteiras (não mexe em pedaços de palavra: "Pós" não vira "Ciprias")."""
    for a, b in rules:
        text = re.sub(r'(?<!\w)' + re.escape(a) + r'(?!\w)', b, text)
    return text


# Frases de chamada da loja deles ("Compra online!", "Descobre-a na nossa perfumaria online") saem da descrição
LOJA = re.compile(r'\bcompr[ae]|online|\bloja\b|\baqui\b|recebe em casa|nossa perfumaria|o botic[aá]rio pt', re.I)


def clean_desc(d):
    d = re.sub(r'<[^>]+>', ' ', d or '')
    d = re.sub(r'\s+', ' ', d).strip()
    d = re.sub(r'([.!?])(?=[A-ZÁÉÍÓÚÂÊÔÀ])', r'\1 ', d)
    d = ' '.join(f for f in re.split(r'(?<=[.!?])\s+', d) if not LOJA.search(f)).strip()
    if len(d) > 300:  # corta na última frase inteira
        cut = d[:300]
        d = cut[:cut.rfind('. ') + 1] if '. ' in cut else cut.rsplit(' ', 1)[0] + '…'
    return sub_all(d, BR)


def line_of(name, brand):
    n = norm(name)
    for known in LINHAS:
        if re.search(r'(?<!\w)' + re.escape(norm(known)) + r'(?!\w)', n):
            return known
    b = ALIAS.get(norm(brand), (brand or '').strip())
    if b and norm(b) not in ('o boticario', 'boticario', 'o boticario pt'):
        return b
    return 'O Boticário'


def category(name, line):
    """name e line já sem acento e em minúsculas"""
    n = name
    if KITS.search(n):
        return 'kits'
    if ACESS.search(n):
        return 'acessorios'
    if 'barba' in n:
        return 'masculino'
    if line == 'match.' or CABELO.search(n):
        return 'cabelos'
    body = CORPO.search(n)
    if MAKE.search(n) and 'corporal' not in n:
        return 'make'
    if ROSTO.search(n) and not PERFUME.search(n) and not body:
        return 'rosto'
    if MASC.search(n + ' ' + line):
        return 'masculino'
    if PERFUME.search(n) and not re.search(r'\bcreme\b|loca|oleo|sabonete|esfoliante', n):
        return 'perfumes'
    if line in ('quem disse, berenice?', 'make b.') and not body:
        return 'make'
    return 'corpo'


# Correções pontuais (id -> categoria)
CATEGORIA_FIXA = {'glamour-secrets-black-intense-75ml': 'perfumes'}


def split_size(name):
    m = re.search(r',?\s*\(?(\d+(?:[.,]\d+)?)\s?(ml|gr|g|kg|l)\b\)?\s*$', name, re.I)
    if not m:
        m = re.search(r',?\s*\(?(\d+(?:[.,]\d+)?)\s?(ml|gr|g)\b\)?', name, re.I)
    if not m:
        return name.strip(' ,.'), ''
    unit = m.group(2).lower().replace('gr', 'g')
    size = f'{m.group(1).replace(".", ",")} {unit}'
    rest = (name[:m.start()] + name[m.end():]).strip(' ,-.')
    return re.sub(r'\s{2,}', ' ', rest), size


def white_corners(im):
    rgb = im.convert('RGB')
    w, h = rgb.size
    pts = [(2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3), (w // 2, 2), (w // 2, h - 3)]
    return all(min(rgb.getpixel(p)) >= 240 for p in pts)


def flatten(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        return bg.convert('RGB')
    return im.convert('RGB')


def product_color(im):
    small = im.resize((64, 64))
    px = [p for p in small.getdata() if min(p) < 225]
    if not px:
        return None
    r, g, b = (sum(c[i] for c in px) // len(px) for i in range(3))
    return f'#{r:02X}{g:02X}{b:02X}'


def save_photo(urls, dest):
    """Baixa a primeira foto com fundo branco (ou a primeira), corta as sobras e salva quadrada."""
    chosen = None
    for u in [u for u in urls if u][:4]:
        sep = '&' if '?' in u else '?'
        data = get(f'{u}{sep}width=900', binary=True)
        if not data:
            continue
        try:
            im = flatten(Image.open(io.BytesIO(data)))
        except Exception:
            continue
        if chosen is None:
            chosen = im
        if white_corners(im):
            chosen = im
            break
    if chosen is None:
        return None
    im = chosen
    if white_corners(im):
        diff = ImageChops.difference(im, Image.new('RGB', im.size, (255, 255, 255))).convert('L').point(lambda v: 255 if v > 14 else 0)
        box = diff.getbbox()
        if box:
            im = im.crop(box)
        side = int(max(im.size) * 1.1)
        canvas = Image.new('RGB', (side, side), (255, 255, 255))
        canvas.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
        im = canvas
    else:  # foto com fundo colorido: recorte quadrado do centro
        w, h = im.size
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    im = im.resize((560, 560), Image.LANCZOS)
    im.save(dest, 'WEBP', quality=80, method=6)
    return product_color(im)


def read_current():
    try:
        txt = open(OUT_JS, encoding='utf-8').read()
        return {p['id']: p for p in json.loads(txt[txt.index('['):txt.rindex(']') + 1])}
    except (OSError, ValueError):
        return {}


HEADER = '''/* =============================================================================
   PRODUTOS DA VITRINE
   -----------------------------------------------------------------------------
   Produtos, fotos, nomes e preços de https://www.oboticario.pt (importados com
   tools/importar-oboticario.py em {date}). Preços em euro, os de Portugal:
   ajuste se a loja vender por outro valor.
   O ESTOQUE é de exemplo: troque pela quantidade real (0 = esgotado).
   Se a planilha do Google estiver ligada (sheetCsv em content.js), ela manda
   e esta lista só aparece se a planilha não carregar.

   id ........ nome único (vai na sacola; é o mesmo do link no oboticario.pt)
   cat ....... categoria (precisa existir em "categories" no content.js)
   line ...... linha do Boticário (Lily, Malbec, Nativa SPA…)
   name ...... nome do produto: {{ "pt": "...", "it": "..." }}
   size ...... tamanho (75 ml, 200 g…)
   price ..... preço em euro (número com ponto: 37.40)
   stock ..... quantidade em estoque. 0 = esgotado (aparece "Avise-me")
   desc ...... descrição (só em português: no italiano ela não aparece)
   featured .. true = aparece em "Mais amados"
   isNew ..... true = selo "Novo"
   photo ..... foto em assets/img/produtos/
   color ..... cor do brilho atrás do produto (tirada da foto)
   ========================================================================== */

window.PRODUCTS = '''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'oboticario-cache.json'))
    ap.add_argument('--atualizar', action='store_true', help='lê todas as páginas de novo')
    ap.add_argument('--sem-fotos', action='store_true')
    args = ap.parse_args()

    raw = crawl(args.cache, args.atualizar)
    current = read_current()
    os.makedirs(IMG_DIR, exist_ok=True)
    out = []
    seen = set()
    for r in raw:
        name = (r.get('name') or '').strip()
        if not name or not r.get('price') or float(r['price']) < 2 or FORA.search(name) or FORA.search(r.get('brand') or ''):
            continue
        pid = re.sub(r'[^a-z0-9-]+', '-', norm(r['handle'])).strip('-')
        if pid in seen:
            continue
        seen.add(pid)
        name_br = sub_all(name, BR)
        base, size = split_size(name_br)
        line = line_of(base, r.get('brand'))
        cat = CATEGORIA_FIXA.get(pid) or category(norm(base), norm(line))
        name_it = sub_words(base, IT)
        prev = current.get(pid, {})
        p = {
            'id': pid,
            'cat': cat,
            'line': line,
            'name': {'pt': base, 'it': name_it} if name_it != base else base,
            'size': size,
            'price': round(float(r['price']), 2),
            'stock': prev.get('stock', ESTOQUE_PADRAO if r.get('avail') == 'InStock' else 0),
        }
        desc = clean_desc(r.get('desc'))
        if desc:
            p['desc'] = desc
        p['featured'] = prev.get('featured', any(pid.startswith(d) for d in DESTAQUES))
        if prev.get('isNew', bool(NOVOS.search(name))):
            p['isNew'] = True
        if not p['featured']:
            del p['featured']
        photo = os.path.join(IMG_DIR, pid + '.webp')
        color = prev.get('color')
        if not args.sem_fotos and (not os.path.exists(photo) or not color):
            print('  foto', pid)
            color = save_photo(r.get('images') or [], photo) or color
            time.sleep(0.2)
        if os.path.exists(photo):
            p['photo'] = 'assets/img/produtos/' + pid + '.webp'
        p['color'] = color or CORES.get(norm(line), '#E2B65A')
        p['source'] = r['url'].split('?')[0]
        out.append(p)

    order = {c: i for i, c in enumerate(CATEGORIAS)}
    out.sort(key=lambda p: (order.get(p['cat'], 99), 0 if p.get('featured') else 1))
    body = '[\n' + ',\n'.join('  ' + json.dumps(p, ensure_ascii=False) for p in out) + '\n];\n'
    open(OUT_JS, 'w', encoding='utf-8').write(HEADER.format(date=time.strftime('%d/%m/%Y')) + body)
    counts = {c: sum(1 for p in out if p['cat'] == c) for c in CATEGORIAS}
    print(f'products.js: {len(out)} produtos', counts)


if __name__ == '__main__':
    main()
