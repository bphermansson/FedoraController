# FedoraController

A small Android-friendly web app for running predefined commands on a Fedora desktop. You can use your phone to run these commands on a Fedora computer:
- Volume Up
- Volume Down
- Sleep
- Screen Off
- Play/Pause

All code vibecoded with GitHub Copilot.

## 1. Install

```bash
cd /path/to/FedoraController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2. Run the server

```bash
uvicorn server.main:app --host 0.0.0.0 --port 8001
```

## 4. Open on Android

Open `http://YOUR_FEDORA_IP:8001` in your Android browser. ("ip a").

Copy the user-scoped service unit into your user systemd directory:

```bash
mkdir -p ~/.config/systemd/user
```
Adjust paths in service file:
```
nano systemd/user/fedora-controller.service 
```
Copyy the file and reload Systemd:
```
cp systemd/user/fedora-controller.service ~/.config/systemd/user/fedora-controller.service
systemctl --user daemon-reload
systemctl --user enable --now fedora-controller.service
systemctl --user status fedora-controller.service --no-pager
```

If you want the service to start automatically when you log in, enable it with `systemctl --user enable fedora-controller.service`.
