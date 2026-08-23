import http.server
import socketserver
import json
import sqlite3
import os
import urllib.parse
import time
import uuid

PORT = 8000
DB_FILE = 'users.db'
GOOGLE_CLIENT_ID = '548435382915-hubfd46jd0h67niu731o8ldt1g55uant.apps.googleusercontent.com'

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            org TEXT,
            avatar TEXT
        )
    ''')
    # Seed default admin user if not exists
    try:
        c.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", 
                  ('usr_admin', 'Priyanshi Saini', 'admin@trinetra.io', 'admin123', 'admin', 'TRINETRA HQ', 'P'))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()

class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/login':
            self.handle_login()
        elif parsed_url.path == '/api/signup':
            self.handle_signup()
        elif parsed_url.path == '/api/google-login':
            self.handle_google_login()
        else:
            self.send_error(404, "Not Found")

    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        email = data.get('email')
        password = data.get('password')
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT id, name, email, role, org, avatar FROM users WHERE email = ? AND password = ?", (email, password))
        user = c.fetchone()
        conn.close()
        
        if user:
            response_data = {
                "ok": True,
                "session": {
                    "userId": user[0],
                    "name": user[1],
                    "email": user[2],
                    "role": user[3],
                    "org": user[4],
                    "avatar": user[5],
                    "loginTime": int(time.time() * 1000),
                    "expiresAt": int((time.time() + 24 * 60 * 60) * 1000)
                }
            }
            self.send_json(response_data)
        else:
            self.send_json({"ok": False, "error": "Invalid email or password."}, status=401)

    def handle_signup(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            self.send_json({"ok": False, "error": "All fields are required."}, status=400)
            return

        user_id = 'usr_' + uuid.uuid4().hex[:8]
        avatar = name[0].upper() if name else 'U'
        role = 'user'
        org = 'My Organization'

        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", 
                      (user_id, name, email, password, role, org, avatar))
            conn.commit()
            response_data = {
                "ok": True,
                "session": {
                    "userId": user_id,
                    "name": name,
                    "email": email,
                    "role": role,
                    "org": org,
                    "avatar": avatar,
                    "loginTime": int(time.time() * 1000),
                    "expiresAt": int((time.time() + 24 * 60 * 60) * 1000)
                }
            }
            self.send_json(response_data)
        except sqlite3.IntegrityError:
            self.send_json({"ok": False, "error": "An account with this email already exists."}, status=400)
        finally:
            conn.close()

    def handle_google_login(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        id_token = data.get('idToken')
        
        if not id_token:
            self.send_json({"ok": False, "error": "Token is required."}, status=400)
            return

        # Query Google APIs to verify JWT tokeninfo
        import urllib.request
        import urllib.error
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            with urllib.request.urlopen(url) as response:
                token_info = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print("Token verification error:", e)
            self.send_json({"ok": False, "error": "Failed to verify Google Token with Google APIs."}, status=400)
            return

        # Check audience if configured
        if GOOGLE_CLIENT_ID and not GOOGLE_CLIENT_ID.startswith('YOUR_GOOGLE_CLIENT_ID'):
            if token_info.get('aud') != GOOGLE_CLIENT_ID:
                self.send_json({"ok": False, "error": "Invalid token audience."}, status=400)
                return

        email = token_info.get('email')
        if not email:
            self.send_json({"ok": False, "error": "Email not returned by Google."}, status=400)
            return

        name = token_info.get('name', 'Google User')
        avatar = token_info.get('picture', email[0].upper() if email else 'G')
        
        # Check / create user in sqlite
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT id, name, email, role, org, avatar FROM users WHERE email = ?", (email,))
        user = c.fetchone()
        
        if not user:
            # Create user
            user_id = 'usr_' + uuid.uuid4().hex[:8]
            role = 'user'
            org = 'My Organization'
            # Insert with random placeholder password (login via google only)
            random_pw = uuid.uuid4().hex
            c.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)",
                      (user_id, name, email, random_pw, role, org, avatar))
            conn.commit()
            user = (user_id, name, email, role, org, avatar)
        else:
            # Update user details if updated from Google
            try:
                c.execute("UPDATE users SET name = ?, avatar = ? WHERE email = ?", (name, avatar, email))
                conn.commit()
                user = (user[0], name, email, user[3], user[4], avatar)
            except Exception as update_err:
                print("Failed to update user profile:", update_err)
        
        conn.close()
        
        # Generate session
        response_data = {
            "ok": True,
            "session": {
                "userId": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
                "org": user[4],
                "avatar": user[5],
                "loginTime": int(time.time() * 1000),
                "expiresAt": int((time.time() + 24 * 60 * 60) * 1000)
            }
        }
        self.send_json(response_data)

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

if __name__ == '__main__':
    init_db()
    # Ensure serving from workspace directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Enable socket reuse to avoid "Address already in use" errors on restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("127.0.0.1", PORT), MyRequestHandler) as httpd:
        print(f"TRINETRA Secure Database Server running on http://127.0.0.1:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
