"""Atualiza páginas, pastas e índice de fotos sem dependências externas."""
from pathlib import Path
import json, re, unicodedata, html
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
GROUPS = json.loads((ROOT / 'data/catalogo.json').read_text(encoding='utf-8'))
PHOTO_ROOT = ROOT / 'assets/servicos'
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()).strip('-')

def images():
    manifest = {}
    for g in GROUPS:
        for service in g['services']:
            key = g['id'] + '/' + slug(service['name'])
            folder = PHOTO_ROOT / key
            folder.mkdir(parents=True, exist_ok=True)
            files = sorted((p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS), key=lambda p: [int(s) if s.isdigit() else s.lower() for s in re.split(r'(\d+)', p.name)])
            manifest[key] = [p.relative_to(ROOT).as_posix() for p in files]
    return manifest

def update_images():
    result = images()
    (ROOT / 'js/galerias-dados.js').write_text('window.UNIKA_GALERIAS = ' + json.dumps(result, ensure_ascii=False) + ';\n', encoding='utf-8')
    return result

def build():
    esc = html.escape
    nav = '<a class="catalog-all" href="servicos.html">Todos os produtos</a>'
    for g in GROUPS:
        active = ' data-group="' + g['id'] + '"'
        nav += '<details class="product-menu"' + active + '><summary><span class="print-drop" aria-hidden="true"></span><span>' + esc(g['name']) + '</span></summary><div class="product-dropdown"><a class="group-link" href="' + g['id'] + '.html">Ver catálogo completo →</a>'
        nav += ''.join('<a href="' + g['id'] + '.html#' + slug(s['name']) + '">' + esc(s['name']) + '</a>' for s in g['services'])
        nav += '</div></details>'
    nav += '<div class="mobile-institutional"><a href="sobre.html">Sobre nós</a><a href="portfolio.html">Portfólio</a><a href="contato.html">Contato</a></div>'
    template = (ROOT / 'index.html').read_text(encoding='utf-8')
    template = re.sub(r'(<nav class="product-nav container"[^>]*>).*?</nav>', lambda m: m[1]+nav+'</nav>', template, flags=re.S)
    header = re.search(r'<header.*?</header>', template, re.S).group()
    footer = re.search(r'<footer.*?</footer>', template, re.S).group()
    def page(title, main):
        return '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' | Unika Print</title><meta name="description" content="'+esc(title)+' personalizados pela Unika Print. Conheça as opções e solicite seu orçamento."><link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/catalog.css"></head><body class="catalog-page">'+header+'<main>'+main+'</main>'+footer+'<script src="js/main.js" defer></script><script src="js/catalog.js" defer></script><script src="js/galerias-dados.js" defer></script><script src="js/galeria.js" defer></script></body></html>'
    manifest = update_images()
    guide = ['# Fotos dos serviços', '', 'Coloque as imagens na pasta do serviço correspondente. JPG, JPEG, PNG, WebP, AVIF e GIF são aceitos. Use 01.jpg, 02.jpg, 03.jpg para definir a ordem. O primeiro arquivo em ordem alfabética/natural será a capa.', '', '## Como visualizar e publicar', '', '- No computador: abra PREVISUALIZAR.cmd e acesse http://localhost:4173. Ao adicionar fotos, recarregue a página; o servidor detecta os arquivos automaticamente.', '- Hospedagem com PHP: envie também galerias.php e as pastas assets/servicos. As fotos são detectadas automaticamente ao recarregar a página.', '- Hospedagem estática (sem PHP): depois de colocar as fotos, execute ATUALIZAR-FOTOS.cmd e envie as imagens e js/galerias-dados.js atualizados. Um navegador estático não consegue listar pastas sozinho.', '- A imagem de capa abre a galeria daquele serviço. Use as setas, as teclas ←/→ ou deslize no celular. Esc fecha a galeria.', '- Sem foto, o card mantém uma capa com o nome do serviço. Nenhuma foto de outro serviço é usada no lugar.', '', '## Pastas por serviço', '']
    for g in GROUPS:
        cards = ''
        for s in g['services']:
            sid = slug(s['name']); key = g['id']+'/'+sid
            folder = PHOTO_ROOT / key
            (folder / 'LEIA-ME.txt').write_text('Fotos de: '+s['name']+'\nColoque aqui as imagens deste serviço. Exemplo: 01.jpg, 02.jpg, 03.png.\nVeja COMO-ADICIONAR-FOTOS.md na pasta principal.\n', encoding='utf-8')
            guide += ['- '+g['name']+' → '+s['name']+': `assets/servicos/'+key+'/`']
            photos = manifest[key]
            media = '<img src="'+esc(photos[0],quote=True)+'" alt="'+esc(s['name'])+' — projeto Unika Print" loading="lazy">' if photos else '<span class="product-placeholder"><span>'+esc(s['name'])+'</span><small>Produção personalizada · Consulte possibilidades</small></span>'
            hint = 'Ampliar e ver fotos ↗' if photos else 'Fotos em breve'
            cards += '<article class="product-card" id="'+sid+'" data-gallery="'+key+'"><button type="button" class="gallery-cover" aria-label="Ver fotos de '+esc(s['name'],quote=True)+'" '+('' if photos else 'disabled')+'>'+media+'<span class="gallery-hint">'+hint+'</span></button><div class="product-card-content"><span class="service-kicker">'+esc(g['name'])+'</span><h2>'+esc(s['name'])+'</h2><ul class="service-options">'+''.join('<li>'+esc(t)+'</li>' for t in s['items'])+'</ul><a class="product-quote" href="https://wa.me/5541999760382?text='+quote('Olá, Unika Print! Gostaria de um orçamento para '+s['name']+'.')+'">Solicitar orçamento ↗</a></div></article>'
        main = '<section class="catalog-intro container"><a class="breadcrumb" href="servicos.html">Produtos</a><span class="breadcrumb"> / '+esc(g['name'])+'</span><h1>'+esc(g['name'])+'</h1><p>Conheça as opções e encontre a solução para sua ideia.</p><span class="catalog-count">'+str(len(g['services']))+' serviços · Clique nas fotos para explorar os projetos</span></section><section class="container product-grid" aria-label="Catálogo de '+esc(g['name'])+'">'+cards+'</section>'
        (ROOT / (g['id']+'.html')).write_text(page(g['name'], main), encoding='utf-8')
    listing = '<section class="catalog-intro container"><span class="eyebrow">Nossas soluções</span><h1>O que sua marca precisa?</h1><p>Escolha um grupo para explorar os produtos e serviços.</p></section><section class="container category-grid">'+''.join('<a class="category-card" href="'+g['id']+'.html"><span class="print-drop" aria-hidden="true"></span><h2>'+esc(g['name'])+'</h2><p>'+str(len(g['services']))+' serviços personalizados para você e sua empresa.</p><strong>Explorar catálogo →</strong></a>' for g in GROUPS)+'</section>'
    (ROOT / 'servicos.html').write_text(page('Todos os produtos', listing), encoding='utf-8')
    for name in ['index.html','sobre.html','portfolio.html','contato.html']:
        path = ROOT / name
        text = re.sub(r'<header.*?</header>', lambda m: header, path.read_text(encoding='utf-8'), count=1, flags=re.S)
        path.write_text(text, encoding='utf-8')
    # Preserve URLs already shared before the category rename.
    for old,new in [('personalizados','presentes-personalizados'),('letras-letreiros','letras-caixa')]:
        (ROOT/(old+'.html')).write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+new+'.html"><title>Catálogo Unika Print</title><a href="'+new+'.html">Acessar catálogo</a></html>',encoding='utf-8')
    (ROOT/'COMO-ADICIONAR-FOTOS.md').write_text('\n'.join(guide)+'\n',encoding='utf-8')
    print('Catálogo atualizado:', sum(len(g['services']) for g in GROUPS), 'serviços.')

if __name__ == '__main__':
    build()
