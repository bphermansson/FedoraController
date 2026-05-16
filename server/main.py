import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

BASE = Path(__file__).resolve().parents[1]
app.mount("/app", StaticFiles(directory=BASE / "app", html=True), name="app")
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")


@app.get("/")
def root():
    return RedirectResponse(url="/app/index.html")

CONFIG_PATH = Path(__file__).resolve().parents[1] / "commands.json"

class CommandRun(BaseModel):
    command_id: str

@dataclass
class Config:
    commands: list[dict]


def load_config() -> Config:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Configuration file not found: {CONFIG_PATH}")
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return Config(commands=data["commands"])


def get_config() -> Config:
    try:
        return load_config()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))


@app.get("/commands")
def list_commands(config: Config = Depends(get_config)):
    return [{"id": cmd["id"], "label": cmd["label"]} for cmd in config.commands]


@app.post("/run")
def run_command(payload: CommandRun, config: Config = Depends(get_config)):
    command = next((cmd for cmd in config.commands if cmd["id"] == payload.command_id), None)
    if command is None:
        raise HTTPException(status_code=404, detail="Command not found")

    shell_command = command["command"]
    try:
        with subprocess.Popen(shell_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) as proc:
            try:
                stdout, stderr = proc.communicate(timeout=20)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait()
                raise HTTPException(status_code=500, detail="Command timed out and was killed")
        completed = subprocess.CompletedProcess(proc.args, proc.returncode, stdout, stderr)
    except HTTPException:
        raise

    if completed.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "stderr": completed.stderr.strip(),
                "stdout": completed.stdout.strip(),
                "returncode": completed.returncode,
            },
        )

    return {"stdout": completed.stdout.strip(), "returncode": completed.returncode}
