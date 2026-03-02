# ⚡ EV Wireless Power Transfer Monitor  
### Real-Time IoT Telemetry Dashboard for Smart EV Charging

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![MQTT](https://img.shields.io/badge/MQTT-TLS-green?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-WebApp-black?style=for-the-badge&logo=flask)
![Render](https://img.shields.io/badge/Deployed-Render-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)

---

## 🚀 Overview

The **EV WPT Monitor** is a real-time IoT telemetry dashboard designed to monitor Wireless Power Transfer (WPT) systems for Electric Vehicles.

It provides secure MQTT-based live data visualization for:

- ⚡ Output Voltage  
- 🔌 Charging Current  
- 🔋 Battery State of Charge (SOC)  
- 📡 Wireless Transfer Power  

This project demonstrates a complete IoT → Cloud → Web Dashboard pipeline suitable for EV research, smart energy systems, and embedded IoT applications.

---

## 🏗️ System Architecture

```
Simulink / IoT Device
        │
        ▼
   MQTT over TLS
        │
        ▼
   EMQX Cloud Broker
        │
        ▼
   Python Backend (Flask + MQTT Client)
        │
        ▼
   Live Web Dashboard
```

---

## 🛠️ Tech Stack

| Layer        | Technology Used |
|-------------|-----------------|
| IoT Protocol | MQTT (TLS Secured) |
| Broker       | EMQX Cloud |
| Backend      | Python (Flask) |
| Frontend     | HTML5, CSS3, JavaScript |
| Deployment   | Render |
| Data Format  | JSON |

---

## 📂 Project Structure

```
EV-Dashboard/
├── app.py              # Flask backend & MQTT client
├── requirements.txt    # Python dependencies
├── render.yaml         # Render deployment configuration
├── .gitignore
├── templates/
│   └── index.html      # Dashboard UI
└── static/
    ├── index.css       # Styling
    └── index.js        # Real-time data updates
```

---

## 🔥 Key Features

✔ Real-time MQTT data subscription  
✔ Secure TLS communication  
✔ Modern dark-themed responsive dashboard  
✔ Live telemetry graph updates  
✔ Cloud deployment ready  
✔ Clean and scalable architecture  

---

## 📡 MQTT Configuration

- Protocol: MQTT over TLS  
- Port: 8883  
- Broker: EMQX Cloud  
- Topic: `ev/data`  
- Payload Format: JSON  

### Example Payload

```json
{
  "voltage": 388.16,
  "current": 8.562,
  "soc": 51.6,
  "power": 3323.29
}
```

---

## 💻 Local Installation Guide

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abuhuraira071/EV-Dashboard.git
cd EV-Dashboard
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate environment:

Windows:
```bash
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Configure MQTT Credentials

Update inside `app.py`:

```python
BROKER = "your-emqx-endpoint"
PORT = 8883
USERNAME = "your-username"
PASSWORD = "your-password"
```

### 5️⃣ Run Application

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## ☁️ Deployment (Render)

1. Push project to GitHub  
2. Connect repository to Render  
3. Add environment variables  
4. Deploy  

`render.yaml` is included for automated deployment.

---

## 📊 Dashboard Capabilities

- Real-time Voltage Monitoring
- Charging Current Visualization
- Battery SOC Tracking
- Wireless Transfer Power Display
- Live Graph Rendering
- Secure MQTT Data Handling

---

## 🧠 Engineering Highlights

- End-to-end IoT data pipeline
- Secure TLS-based MQTT communication
- Low-latency real-time visualization
- Clean UI with modern telemetry design
- Cloud-native architecture

---

## 🚀 Future Enhancements

- Historical data storage (InfluxDB / PostgreSQL)
- Advanced analytics & reporting
- Mobile optimized UI
- Authentication & user roles
- Docker containerization
- CI/CD integration
- Multi-device monitoring support

---

## 👨‍💻 Author

Abu Huraira  
IoT | Embedded Systems | EV Charging | Smart Energy Systems  

GitHub: https://github.com/abuhuraira071  

---

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub.  
It motivates further innovation and development.

---

# ⚡ Smart Energy • IoT • EV Innovation
