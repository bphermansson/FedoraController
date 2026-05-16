# FedoraController

A small Android-friendly web app for running predefined commands on a Fedora desktop.

## 1. Install

```bash
cd /run/media/patrik/Extra1TB/Programmering/Python/FedoraController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure

Copy the example config and edit it before use:

```bash
cp commands.example.json commands.json
```

Edit `commands.json` and set a strong `api_token`.

## 3. Run the server

```bash
source .venv/bin/activate
uvicorn server.main:app --host 0.0.0.0 --port 8001
```

## 4. Open on Android

Open `http://YOUR_FEDORA_IP:8001` in your Android browser.
Enter the server URL and API token, then fetch buttons.

## 5. Example Fedora commands

- Volume Up
- Volume Down
- Sleep
- Screen Off
- Play/Pause
