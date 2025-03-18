
from http.server import HTTPServer, SimpleHTTPRequestHandler

server_address = ('0.0.0.0', 8000)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
print('Server running on port 8000...')
httpd.serve_forever()
