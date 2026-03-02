import sys
import os
import threading
import webbrowser
import ssl
import uuid
import json

# ── PyInstaller path fix ───────────────────────────────────
def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paho.mqtt.client as mqtt

# ── Flask App ──────────────────────────────────────────────
#    templates/ → HTML files
#    static/    → CSS, JS, assets
app = Flask(
    __name__,
    template_folder=resource_path('templates'),
    static_folder=resource_path('static')
)
app.config['SECRET_KEY'] = 'ev_secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ══════════════════════════════════════════════════════════
#  MQTT SETTINGS
# ══════════════════════════════════════════════════════════
BROKER   = "w11117bb.ala.us-east-1.emqxsl.com"
PORT     = 8883
TOPIC    = "ev/voltage"       # matches MATLAB Topic property
USERNAME = "Ev_project"
PASSWORD = "Ev_project1626"   # matches MATLAB Password property

# ── Rolling data histories ─────────────────────────────────
MAX_POINTS = 100
histories = {
    'voltage': [],   # Volts  (V)   — Mux input 1
    'current': [],   # Amps   (A)   — Mux input 2
    'soc':     [],   # %            — Mux input 3
    'power':   [],   # Watts  (W)   — calculated V × I
}
mqtt_status = {"connected": False}

# ══════════════════════════════════════════════════════════
#  PAYLOAD PARSER
#  MATLAB sends:  jsonencode(double(u))
#  Scalar  →  "230.5"
#  Vector  →  "[230.5,15.2,80.1]"
#  Matrix  →  "[[v1,v2],[v3,v4]]"
# ══════════════════════════════════════════════════════════
def parse_payload(raw):
    raw = raw.strip()

    # Try JSON first (MATLAB jsonencode output)
    try:
        data = json.loads(raw)

        def flatten(x):
            if isinstance(x, list):
                out = []
                for item in x:
                    out.extend(flatten(item))
                return out
            return [float(x)]

        values = flatten(data)
        print(f"   JSON parsed → {values}")

    except (json.JSONDecodeError, TypeError):
        # Fallback: plain number or comma-separated string
        values = [float(p.strip()) for p in raw.split(',')]
        print(f"   CSV parsed  → {values}")

    n = len(values)
    if n == 0:
        raise ValueError("Empty payload")
    elif n == 1:
        voltage, current, soc = values[0], 0.0, 0.0
    elif n == 2:
        voltage, current, soc = values[0], values[1], 0.0
    else:
        voltage, current, soc = values[0], values[1], values[2]

    power = round(abs(voltage * current), 4)
    soc   = max(0.0, min(100.0, soc))
    return voltage, current, soc, power


# ── MQTT Callbacks ─────────────────────────────────────────
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        mqtt_status["connected"] = True
        print("✅ MQTT Connected!")
        client.subscribe(TOPIC)
        print(f"📡 Subscribed to: '{TOPIC}'")
        socketio.emit('mqtt_status', {'connected': True})
    else:
        mqtt_status["connected"] = False
        codes = {1:"Wrong protocol version",2:"Invalid client ID",
                 3:"Broker unavailable",4:"Bad credentials",5:"Not authorized"}
        reason = codes.get(rc, f'Unknown rc={rc}')
        print(f"❌ MQTT Failed: {reason}")
        socketio.emit('mqtt_status', {'connected': False, 'reason': reason})

def on_message(client, userdata, msg):
    raw = msg.payload.decode(errors='replace').strip()
    print(f"\n📩 Topic  : {msg.topic}")
    print(f"   Payload: '{raw}'")
    try:
        voltage, current, soc, power = parse_payload(raw)
        print(f"   ✅ V={voltage:.4f}V | I={current:.4f}A | SOC={soc:.4f}% | P={power:.4f}W")

        for key, val in [('voltage',voltage),('current',current),
                         ('soc',soc),('power',power)]:
            histories[key].append(round(val, 4))
            if len(histories[key]) > MAX_POINTS:
                histories[key] = histories[key][-MAX_POINTS:]

        socketio.emit('new_data', {
            'voltage': voltage, 'current': current,
            'soc': soc,         'power': power,
            'histories': {
                'voltage': list(histories['voltage']),
                'current': list(histories['current']),
                'soc':     list(histories['soc']),
                'power':   list(histories['power']),
            }
        })
    except Exception as e:
        print(f"   ⚠️  Parse failed: {e} | raw='{raw}'")

def on_disconnect(client, userdata, rc):
    mqtt_status["connected"] = False
    print(f"🔌 MQTT Disconnected rc={rc}")
    socketio.emit('mqtt_status', {'connected': False, 'reason': f'rc={rc}'})
    if rc != 0:
        print("🔄 Reconnecting in 3s...")
        import time; time.sleep(3)
        try:
            client.reconnect()
        except Exception as e:
            print(f"❌ Reconnect failed: {e}")

# ── MQTT Thread ────────────────────────────────────────────
def start_mqtt():
    mqtt_client = mqtt.Client(
        client_id=f"flask-{uuid.uuid4()}",
        clean_session=True,
        protocol=mqtt.MQTTv311
    )
    mqtt_client.username_pw_set(USERNAME, PASSWORD)

    ca_cert = r"C:\Users\DELL\OneDrive\Documents\MATLAB\emqxsl-ca.crt"
    if os.path.isfile(ca_cert):
        print(f"🔐 Using CA cert: {ca_cert}")
        mqtt_client.tls_set(ca_certs=ca_cert)
    else:
        print("🔐 CA cert not found — TLS without verification")
        mqtt_client.tls_set(cert_reqs=ssl.CERT_NONE)
        mqtt_client.tls_insecure_set(True)

    mqtt_client.on_connect    = on_connect
    mqtt_client.on_message    = on_message
    mqtt_client.on_disconnect = on_disconnect

    print(f"🔄 Connecting to {BROKER}:{PORT}...")
    try:
        mqtt_client.connect(BROKER, PORT, keepalive=60)
        mqtt_client.loop_forever()
    except Exception as e:
        print(f"🚨 MQTT error: {e}")

threading.Thread(target=start_mqtt, daemon=True).start()

# ── Auto-open browser ──────────────────────────────────────
def open_browser():
    import time; time.sleep(1.5)
    webbrowser.open("http://localhost:5000")

threading.Thread(target=open_browser, daemon=True).start()

# ── Routes ─────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print("🌐 Browser connected via WebSocket")
    emit('new_data', {
        'voltage': histories['voltage'][-1] if histories['voltage'] else 0,
        'current': histories['current'][-1] if histories['current'] else 0,
        'soc':     histories['soc'][-1]     if histories['soc']     else 0,
        'power':   histories['power'][-1]   if histories['power']   else 0,
        'histories': {
            'voltage': list(histories['voltage']),
            'current': list(histories['current']),
            'soc':     list(histories['soc']),
            'power':   list(histories['power']),
        }
    })
    emit('mqtt_status', {'connected': mqtt_status["connected"]})

@socketio.on('disconnect')
def handle_disconnect():
    print("🌐 Browser disconnected")

# ── Entry Point ────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 55)
    print("  🚀  EV Dashboard  →  http://localhost:5000")
    print("=" * 55)
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, use_reloader=False)