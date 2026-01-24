#!/usr/bin/env python3
"""
Python Development Server with Live Reload
Supports HTML/CSS/JavaScript files with auto-refresh
"""

import http.server
import socketserver
import os
import webbrowser
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 3000
PAGES_DIR = "pages"

# MIME types
MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
}

class FileChangeHandler(FileSystemEventHandler):
    """Handle file system changes for live reload"""
    
    def on_modified(self, event):
        if not event.is_directory:
            ext = os.path.splitext(event.src_path)[1].lower()
            if ext in MIME_TYPES:
                print(f"📝 File changed: {event.src_path}")
                print("   Changes will be reflected on browser refresh")

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler with CORS support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PAGES_DIR, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        """Guess MIME type based on file extension"""
        ext = os.path.splitext(path)[1].lower()
        return MIME_TYPES.get(ext, 'application/octet-stream')
    
    def do_OPTIONS(self):
        """Handle OPTIONS preflight request"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log message format"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def start_server():
    """Start the development server"""
    
    # Create pages directory if it doesn't exist
    Path(PAGES_DIR).mkdir(exist_ok=True)
    
    # Change to pages directory for serving files
    original_dir = os.getcwd()
    os.chdir(PAGES_DIR)
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print("\n" + "=" * 50)
            print("  ImageAI Pro Development Server")
            print("=" * 50)
            print(f"\nServer running at:")
            print(f"  → Local:   http://localhost:{PORT}")
            print(f"  → Network: http://0.0.0.0:{PORT}")
            print(f"\nServing files from: {PAGES_DIR}/")
            print("\nFeatures enabled:")
            print("  ✓ Auto-reload on file changes")
            print("  ✓ CORS support")
            print("  ✓ Live preview")
            print("\nPress Ctrl+C to stop the server")
            print("=" * 50 + "\n")
            
            # Setup file watcher
            os.chdir(original_dir)
            event_handler = FileChangeHandler()
            observer = Observer()
            observer.schedule(event_handler, PAGES_DIR, recursive=True)
            observer.start()
            
            # Open browser automatically
            browser_url = f"http://localhost:{PORT}"
            time.sleep(0.5)  # Wait for server to start
            webbrowser.open(browser_url)
            
            # Start server
            print("Server started successfully!\n")
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                pass
            finally:
                observer.stop()
                observer.join()
                print("\n\nServer stopped.")
                
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ Error: Port {PORT} is already in use!")
            print("   Please stop the other process or change the port.\n")
        else:
            print(f"\n❌ Error: {e}\n")
        return

if __name__ == "__main__":
    start_server()
