"""Run with python3 serve.py, then visit http://localhost:8000 (Ctrl+C to stop)."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parent)
if __name__=='__main__':
    print('Diabetes in Australia: http://localhost:8000 — Ctrl+C to stop')
    try: ThreadingHTTPServer(('127.0.0.1',8000),SimpleHTTPRequestHandler).serve_forever()
    except KeyboardInterrupt: pass
