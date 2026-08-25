import asyncio
import urllib.request
import urllib.error
import urllib.parse
import websockets
import json
import sys

BASE_URL = "https://ransomware-detection-system-f2pi.onrender.com"
WS_URL = "wss://ransomware-detection-system-f2pi.onrender.com/ws"
USERNAME = "admin"
PASSWORD = "admin"

def make_request(path, method="GET", data=None, token=None):
    url = BASE_URL + path
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = None
    if data is not None:
        if isinstance(data, dict):
            if method == "POST" and "application/x-www-form-urlencoded" in headers.get("Content-Type", ""):
                req_data = urllib.parse.urlencode(data).encode('utf-8')
            else:
                req_data = json.dumps(data).encode('utf-8')
                headers["Content-Type"] = "application/json"
        elif isinstance(data, list):
            req_data = json.dumps(data).encode('utf-8')
            headers["Content-Type"] = "application/json"
        else:
            req_data = data.encode('utf-8')
            if method == "POST" and "Content-Type" not in headers:
                headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            body = response.read().decode('utf-8')
            try:
                body_json = json.loads(body)
                return status_code, body_json
            except:
                return status_code, body
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            body_json = json.loads(body)
            return e.code, body_json
        except:
            return e.code, body
    except urllib.error.URLError as e:
        return 500, str(e.reason)


async def run_tests():
    print("Starting Production API Tests...")
    
    # 1. Test POST /auth/login
    print("\n--- Test POST /auth/login ---")
    data = json.dumps({"username": USERNAME, "password": PASSWORD}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    token = None
    try:
        with urllib.request.urlopen(req) as res:
            if res.getcode() == 200:
                print("PASS: /auth/login HTTP 200")
                data_json = json.loads(res.read().decode('utf-8'))
                token = data_json.get("access_token")
            else:
                print(f"FAIL: /auth/login - {res.getcode()}")
                return
    except Exception as e:
        print(f"FAIL: /auth/login - {str(e)}")
        return
        
    # 2. GET /dashboard/state
    print("\n--- Test GET /dashboard/state ---")
    code, res = make_request("/dashboard/state", method="GET", token=token)
    if code == 200:
        print("PASS: /dashboard/state HTTP 200")
    else:
        print(f"FAIL: /dashboard/state - {code} - {res}")

    # 3. GET /policy/config
    print("\n--- Test GET /policy/config ---")
    code, res = make_request("/policy/config", method="GET", token=token)
    if code == 200:
        print("PASS: /policy/config HTTP 200")
    else:
        print(f"FAIL: /policy/config - {code}")
        
    # 4. WebSocket Tests
    print("\n--- Test WebSocket Connection ---")
    try:
        async with websockets.connect(WS_URL) as ws:
            print("PASS: WebSocket connected")
            
            # Send Auth Message
            auth_msg = {"type": "auth", "token": token}
            await ws.send(json.dumps(auth_msg))
            
            # Receive Response
            res = await ws.recv()
            res_data = json.loads(res)
            if res_data.get("type") == "auth_success":
                print("PASS: WebSocket auth_success")
            else:
                print("FAIL: WebSocket auth failed")
                return

            # Trigger real-time events using /simulate/start
            print("\n--- Triggering Simulation for Real-time Events ---")
            code, res = make_request("/simulate/start", method="POST", token=token, data={})
            if code in [200, 202, 204]:
                print(f"PASS: /simulate/start HTTP {code}")
            else:
                print(f"FAIL: /simulate/start - {code} - {res}")

            print("Listening for realtime events for 5 seconds...")
            events = []
            try:
                for _ in range(5):
                    event = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    events.append(json.loads(event))
            except asyncio.TimeoutError:
                pass
            
            if len(events) > 0:
                print(f"PASS: Real-time events received over WebSocket. Received {len(events)} events.")
            else:
                print("FAIL: No events received.")
                
    except Exception as e:
        print(f"FAIL: WebSocket connection error - {str(e)}")

asyncio.run(run_tests())
