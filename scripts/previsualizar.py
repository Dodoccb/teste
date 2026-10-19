"""Servidor local com leitura automática das pastas de fotos."""
import json, os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from atualizar_catalogo import ROOT, update_images

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] == '/galerias.php':
            payload = json.dumps(update_images(), ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()

os.chdir(ROOT)
print('Prévia: http://localhost:4173 — recarregue a página após adicionar fotos.', flush=True)
ThreadingHTTPServer(('127.0.0.1', 4173), Handler).serve_forever()
