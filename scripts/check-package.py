from zipfile import ZipFile
with ZipFile('SITE-FDG-PARA-PUBLICAR.zip') as archive:
    names={name.replace('\\','/') for name in archive.namelist()}
    actual=next(name for name in archive.namelist() if name.replace('\\','/')=='palestras/index.html')
    html=archive.read(actual).decode('utf-8')
    assert 'href="../css/style.css"' in html
    assert 'src="../js/main.js"' in html
    assert 'especialistas/lucas-astori/index.html' in names
    assert 'assets/images/clientes/cwg-construtora.jpg' in names
    assert archive.testzip() is None
    print(f'Pacote verificado: {len(names)} arquivos. CSS e scripts relativos, perfis e logos presentes.')
