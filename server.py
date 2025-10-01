#!/usr/bin/env python3
"""
Vyoma VR Therapy Platform - Development Server
Simple HTTP server with CORS headers for local development
"""

import http.server
import socketserver
import os
from http.server import SimpleHTTPRequestHandler

PORT = 8000

class CORSRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Service-Worker-Allowed', '/')
        return super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 50)
    print("  VYOMA VR THERAPY PLATFORM")
    print("  Development Server")
    print("=" * 50)
    print(f"\nStarting server on port {PORT}...")
    print(f"\nServer running at:")
    print(f"  http://localhost:{PORT}")
    print(f"  http://127.0.0.1:{PORT}")
    print(f"\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
            pass