import json
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import request as urllib_request

import tkinter as tk
from tkinter import messagebox


PORTS = {
    "Patient Portal": 3000,
    "Org Portal": 4000,
    "Organization Registration Portal": 4173,
    "Super Admin Portal": 5000,
    "API Gateway": 8000,
    "LiveKit HTTP": 7880,
    "LiveKit RTC": 7881,
    "ngrok API": 4040,
    "ngrok API (Fallback)": 4041,
    "Front Door": 8090,
    "pgadmin": 5050,
}


@dataclass
class ManagedProcess:
    name: str
    command: list[str]
    cwd: Path
    process: subprocess.Popen | None = None
    log_path: Path | None = None
    log_file: Any = None


class StackDashboard(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Tenadam Local Stack Admin")
        self.geometry("1280x860")
        self.minsize(920, 640)
        self.configure(bg="#07111f")
        try:
            self.state("zoomed")
        except Exception:
            pass

        self.colors = {
            "bg": "#07111f",
            "panel": "#0f1b2d",
            "panel2": "#12233a",
            "surface": "#091321",
            "text": "#f8fbff",
            "muted": "#8ea6c7",
            "line": "#243954",
            "ok": "#16c47f",
            "danger": "#ff5d73",
            "warn": "#f7b500",
            "blue": "#3c82f6",
            "cyan": "#14b8c4",
            "violet": "#6d7cff",
            "slate": "#425a78",
        }

        self.repo_root = self._find_repo_root(Path(__file__).resolve())
        if self.repo_root is None:
            raise RuntimeError("Could not locate repo root (docker-compose.yml not found).")

        self.logs_dir = self.repo_root / "tools" / "admin-dashboard" / "logs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.dashboard_env_path = self.repo_root / "tools" / "admin-dashboard" / ".env.local"

        self.npm_bin = self._resolve_executable("npm")
        self.docker_bin = self._resolve_executable("docker")
        self.ngrok_bin = self._resolve_executable("ngrok")
        self.ngrok_runtime_config = self.logs_dir / "ngrok-runtime.yml"
        self.ngrok_runtime_config_patient = self.logs_dir / "ngrok-runtime-patient.yml"
        self.ngrok_runtime_config_org = self.logs_dir / "ngrok-runtime-org.yml"

        self.local_ip = self._detect_local_ip()
        self.local_patient_url = f"http://{self.local_ip}:3000"
        self.local_org_url = f"http://{self.local_ip}:4000"

        self.ngrok_patient_url_var = tk.StringVar(value="Not running")
        self.ngrok_org_url_var = tk.StringVar(value="Not running")
        self.local_patient_url_var = tk.StringVar(value=self.local_patient_url)
        self.local_org_url_var = tk.StringVar(value=self.local_org_url)
        self.status_summary_var = tk.StringVar(value="Preparing local control center")
        self.ngrok_mode_var = tk.StringVar(value="ngrok not configured")
        self.patient_token_var = tk.StringVar()
        self.org_token_var = tk.StringVar()

        self._ngrok_mode_note = ""
        self._pre_ui_logs: list[str] = []
        self.port_scan_active = False
        self.ngrok_scan_active = False
        self.port_statuses: dict[str, bool] = {}
        self.port_badges: dict[str, tk.Label] = {}
        self.summary_metric_vars: dict[str, tk.StringVar] = {}
        self.canvas_window_id: int | None = None

        self._load_dashboard_env_vars()

        self.processes: dict[str, ManagedProcess] = {
            "patient": ManagedProcess(
                name="Patient Portal",
                command=[
                    self.npm_bin,
                    "--prefix",
                    str(self.repo_root / "apps" / "web" / "patient-portal"),
                    "run",
                    "dev",
                    "--",
                    "--hostname",
                    "0.0.0.0",
                ],
                cwd=self.repo_root,
            ),
            "org": ManagedProcess(
                name="Org Portal",
                command=[
                    self.npm_bin,
                    "--prefix",
                    str(self.repo_root / "apps" / "web" / "org-portal"),
                    "run",
                    "dev",
                    "--",
                    "--hostname",
                    "0.0.0.0",
                ],
                cwd=self.repo_root,
            ),
            "superadmin": ManagedProcess(
                name="Super Admin Portal",
                command=[
                    self.npm_bin,
                    "--prefix",
                    str(self.repo_root / "apps" / "web"),
                    "run",
                    "dev",
                    "--",
                    "--host",
                    "0.0.0.0",
                    "--port",
                    "5000",
                ],
                cwd=self.repo_root,
            ),
            "registration": ManagedProcess(
                name="Organization Registration Portal",
                command=[
                    self.npm_bin,
                    "--prefix",
                    str(self.repo_root / "apps" / "web" / "org-registration-portal"),
                    "run",
                    "dev",
                    "--",
                    "--host",
                    "0.0.0.0",
                    "--port",
                    "4173",
                ],
                cwd=self.repo_root,
            ),
        }

        self._configure_ngrok_processes()
        self._build_menu()
        self._build_ui()
        self._sync_token_vars_from_env()
        self._flush_pre_ui_logs()
        if self._ngrok_mode_note:
            self.log(self._ngrok_mode_note)
        self._schedule_port_refresh()
        self._schedule_ngrok_refresh()

    @staticmethod
    def _find_repo_root(start: Path) -> Path | None:
        current = start
        for parent in [current, *current.parents]:
            if (parent / "docker-compose.yml").exists():
                return parent
        return None

    @staticmethod
    def _resolve_executable(name: str) -> str:
        candidates = [name]
        if os.name == "nt":
            candidates = [f"{name}.cmd", f"{name}.exe", name]

        for candidate in candidates:
            found = shutil.which(candidate)
            if found:
                return found

        return name

    @staticmethod
    def _detect_local_ip() -> str:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
                sock.connect(("8.8.8.8", 80))
                ip = sock.getsockname()[0]
                if ip:
                    return ip
        except Exception:
            pass
        return "127.0.0.1"

    def _local_origin_for_process(self, key: str) -> str | None:
        if key == "patient":
            return self.local_patient_url
        if key == "org":
            return self.local_org_url
        return None

    def _process_env(self, key: str) -> dict[str, str]:
        env = os.environ.copy()
        local_origin = self._local_origin_for_process(key)
        if local_origin:
            env["NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN"] = local_origin
            try:
                local_host = local_origin.split("//", 1)[1].split("/", 1)[0].split(":", 1)[0].strip()
            except Exception:
                local_host = ""
        else:
            local_host = ""

        # Keep dev-server websocket upgrades permissive for rotating ngrok hostnames.
        origin_items = {
            item.strip()
            for item in (env.get("NEXT_DEV_ALLOWED_ORIGINS") or "").split(",")
            if item.strip()
        }
        origin_items.update({
            "localhost",
            "127.0.0.1",
            "*.ngrok-free.dev",
            "*.ngrok.io",
            "aron-nonpopular-unstubbornly.ngrok-free.dev",
            "marigold-crunching-unblock.ngrok-free.dev",
            (env.get("NGROK_DOMAIN") or "").strip(),
            (env.get("NGROK_DOMAIN_PATIENT") or "").strip(),
            (env.get("NGROK_DOMAIN_ORG") or "").strip(),
            local_host,
        })
        origin_items.discard("")
        env["NEXT_DEV_ALLOWED_ORIGINS"] = ",".join(sorted(origin_items))
        return env

    def _load_dashboard_env_vars(self) -> None:
        if not self.dashboard_env_path.exists():
            return

        try:
            for raw_line in self.dashboard_env_path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and value and key not in os.environ:
                    os.environ[key] = value
        except Exception as exc:
            self.log(f"Could not read dashboard env file: {exc}")

    def _ngrok_tokens(self) -> tuple[str, str, str]:
        patient_token = (os.environ.get("NGROK_AUTHTOKEN_PATIENT") or "").strip()
        org_token = (os.environ.get("NGROK_AUTHTOKEN_ORG") or "").strip()
        shared_token = (os.environ.get("NGROK_AUTHTOKEN") or "").strip()
        return patient_token, org_token, shared_token

    def _sync_token_vars_from_env(self) -> None:
        patient_token, org_token, shared_token = self._ngrok_tokens()
        self.patient_token_var.set(patient_token or shared_token)
        self.org_token_var.set(org_token or shared_token)

    @staticmethod
    def _masked_token(value: str) -> str:
        if not value:
            return ""
        if len(value) <= 8:
            return "*" * len(value)
        return f"{value[:4]}{'*' * (len(value) - 8)}{value[-4:]}"

    def _load_ngrok_authtoken_from_default_configs(self) -> str:
        config_candidates = [
            Path.home() / "AppData" / "Local" / "ngrok" / "ngrok.yml",
            Path.home() / ".config" / "ngrok" / "ngrok.yml",
        ]
        for config_path in config_candidates:
            if not config_path.exists():
                continue
            text = config_path.read_text(encoding="utf-8")
            match = re.search(r"^\s*authtoken\s*:\s*(\S+)\s*$", text, flags=re.MULTILINE)
            if match:
                return match.group(1).strip()
        return ""

    def _load_effective_ngrok_token(self) -> str:
        _patient_token, _org_token, shared_token = self._ngrok_tokens()
        if shared_token:
            return shared_token
        return self._load_ngrok_authtoken_from_default_configs()

    def _build_ngrok_config_args(
        self,
        *,
        config_path: Path,
        authtoken: str,
        web_addr: str,
        include_patient: bool,
        include_org: bool,
    ) -> list[str]:
        try:
            token = authtoken.strip()
            if not token:
                token = self._load_effective_ngrok_token()

            runtime_lines = ["version: 2"]
            if token:
                runtime_lines.append(f"authtoken: {token}")
            else:
                self.log("ngrok authtoken not found. Save tokens in the dashboard.")

            runtime_lines += [
                f"web_addr: {web_addr}",
                "tunnels:",
            ]

            if include_patient:
                runtime_lines += [
                    "  patient-tunnel:",
                    "    proto: http",
                    "    addr: 127.0.0.1:3000",
                ]

            if include_org:
                runtime_lines += [
                    "  org-tunnel:",
                    "    proto: http",
                    "    addr: 127.0.0.1:4000",
                ]

            config_path.write_text("\n".join(runtime_lines) + "\n", encoding="utf-8")
            return ["--config", str(config_path)]
        except Exception as exc:
            self.log(f"ngrok runtime config fallback: {exc}")
            return []

    def _start_managed_process(self, key: str) -> None:
        managed = self.processes[key]
        
        # STRENGTHENED CHECK: Do not start if process exists and is still alive
        if managed.process is not None:
            if managed.process.poll() is None:
                # Process is still running, don't spawn another
                return
            else:
                # Process died, clean up before restarting
                managed.process = None

        log_file_path = self.logs_dir / f"{key}.log"
        try:
            log_file = open(log_file_path, "a")
            managed.log_file = log_file
            
            # Using creationflags to prevent console windows popping up on Windows
            cflags = 0
            if os.name == "nt":
                cflags = subprocess.CREATE_NO_WINDOW

            managed.process = subprocess.Popen(
                managed.command,
                cwd=managed.cwd,
                env=self._process_env(key),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                creationflags=cflags
            )
            self.log(f"Started {managed.name} (pid {managed.process.pid})")
        except Exception as exc:
            self.log(f"Failed to start {managed.name}: {exc}")

    def _configure_ngrok_processes(self) -> None:
        for key in ("ngrok", "ngrok_patient", "ngrok_org"):
            self.processes.pop(key, None)

        self._ngrok_mode_note = ""

        if not shutil.which(self.ngrok_bin):
            self.ngrok_mode_var.set("ngrok CLI not found in PATH")
            return

        patient_token, org_token, _shared_token = self._ngrok_tokens()

        if patient_token and org_token and patient_token != org_token:
            patient_config_args = self._build_ngrok_config_args(
                config_path=self.ngrok_runtime_config_patient,
                authtoken=patient_token,
                web_addr="127.0.0.1:4040",
                include_patient=True,
                include_org=False,
            )
            org_config_args = self._build_ngrok_config_args(
                config_path=self.ngrok_runtime_config_org,
                authtoken=org_token,
                web_addr="127.0.0.1:4041",
                include_patient=False,
                include_org=True,
            )
            self.processes["ngrok_patient"] = ManagedProcess(
                name="ngrok (Patient)",
                command=[self.ngrok_bin, "start", "patient-tunnel", *patient_config_args, "--log", "stdout"],
                cwd=self.repo_root,
            )
            self.processes["ngrok_org"] = ManagedProcess(
                name="ngrok (Organization)",
                command=[self.ngrok_bin, "start", "org-tunnel", *org_config_args, "--log", "stdout"],
                cwd=self.repo_root,
            )
            self._ngrok_mode_note = "ngrok dual-account mode enabled from separate patient and organization tokens."
            self.ngrok_mode_var.set(
                f"Dual-account mode active. Patient {self._masked_token(patient_token)} | Org {self._masked_token(org_token)}"
            )
            return

        ngrok_config_args = self._build_ngrok_config_args(
            config_path=self.ngrok_runtime_config,
            authtoken="",
            web_addr="127.0.0.1:4040",
            include_patient=True,
            include_org=True,
        )
        self.processes["ngrok"] = ManagedProcess(
            name="ngrok (Patient + Organization)",
            command=[self.ngrok_bin, "start", "--all", *ngrok_config_args, "--log", "stdout"],
            cwd=self.repo_root,
        )

        shared_token = self._load_effective_ngrok_token()
        if shared_token:
            self.ngrok_mode_var.set(f"Shared-token mode active. Token {self._masked_token(shared_token)}")
        else:
            self.ngrok_mode_var.set("ngrok token missing. Save both tokens below for dual-account mode.")

    def save_ngrok_tokens(self) -> None:
        patient_token = self.patient_token_var.get().strip()
        org_token = self.org_token_var.get().strip()

        if not patient_token or not org_token:
            messagebox.showwarning("Missing tokens", "Enter both patient and organization ngrok tokens before saving.")
            return

        try:
            self.dashboard_env_path.write_text(
                "\n".join(
                    [
                        "# Local-only admin dashboard secrets",
                        f"NGROK_AUTHTOKEN_PATIENT={patient_token}",
                        f"NGROK_AUTHTOKEN_ORG={org_token}",
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            os.environ["NGROK_AUTHTOKEN_PATIENT"] = patient_token
            os.environ["NGROK_AUTHTOKEN_ORG"] = org_token
            self._configure_ngrok_processes()
            self._refresh_summary_banner()
            self.log(f"Saved dual ngrok tokens to {self.dashboard_env_path}.")
            messagebox.showinfo("ngrok configured", "Both ngrok tokens were saved locally and dual-account tunnel mode is ready.")
        except Exception as exc:
            messagebox.showerror("Save failed", f"Could not save dashboard ngrok tokens.\n\n{exc}")

    def reveal_token_help(self) -> None:
        messagebox.showinfo(
            "ngrok token setup",
            "This dashboard supports two separate ngrok accounts.\n\n"
            "Save both tokens here and it will create a local ignored file at "
            "tools/admin-dashboard/.env.local using NGROK_AUTHTOKEN_PATIENT and NGROK_AUTHTOKEN_ORG.",
        )

    def _build_menu(self) -> None:
        menu = tk.Menu(self, bg="#0f172a", fg="#e2e8f0", tearoff=0)

        stack_menu = tk.Menu(menu, tearoff=0, bg="#0f172a", fg="#e2e8f0")
        stack_menu.add_command(label="Start Backend", command=self.start_backend)
        stack_menu.add_command(label="Stop Backend", command=self.stop_backend)
        stack_menu.add_separator()
        stack_menu.add_command(label="Start Frontend", command=self.start_frontend)
        stack_menu.add_command(label="Stop Frontend", command=self.stop_frontend)
        stack_menu.add_separator()
        stack_menu.add_command(label="Restart All", command=self.restart_all)
        stack_menu.add_command(label="Stop All", command=self.stop_all)
        menu.add_cascade(label="Stack", menu=stack_menu)

        ngrok_menu = tk.Menu(menu, tearoff=0, bg="#0f172a", fg="#e2e8f0")
        ngrok_menu.add_command(label="Start Patient Tunnel", command=self.start_ngrok_patient)
        ngrok_menu.add_command(label="Stop Patient Tunnel", command=self.stop_ngrok_patient)
        ngrok_menu.add_separator()
        ngrok_menu.add_command(label="Start Org Tunnel", command=self.start_ngrok_org)
        ngrok_menu.add_command(label="Stop Org Tunnel", command=self.stop_ngrok_org)
        ngrok_menu.add_separator()
        ngrok_menu.add_command(label="Start Both Tunnels", command=self.start_ngrok)
        ngrok_menu.add_command(label="Stop Both Tunnels", command=self.stop_ngrok)
        ngrok_menu.add_separator()
        ngrok_menu.add_command(label="Open Patient Public", command=self.open_patient_ngrok_url)
        ngrok_menu.add_command(label="Open Org Public", command=self.open_org_ngrok_url)
        menu.add_cascade(label="Tunnels", menu=ngrok_menu)

        links_menu = tk.Menu(menu, tearoff=0, bg="#0f172a", fg="#e2e8f0")
        links_menu.add_command(label="Open Local Patient", command=self.open_local_patient_url)
        links_menu.add_command(label="Open Local Org", command=self.open_local_org_url)
        menu.add_cascade(label="Open", menu=links_menu)

        menu.add_command(label="Exit", command=self.on_close)
        self.config(menu=menu)

    def _build_ui(self) -> None:
        shell = tk.Frame(self, bg=self.colors["bg"])
        shell.pack(fill=tk.BOTH, expand=True)
        shell.grid_columnconfigure(0, weight=1)
        shell.grid_rowconfigure(0, weight=1)

        self.dashboard_canvas = tk.Canvas(
            shell,
            bg=self.colors["bg"],
            highlightthickness=0,
            bd=0,
            relief=tk.FLAT,
        )
        self.dashboard_canvas.grid(row=0, column=0, sticky="nsew")

        scrollbar = tk.Scrollbar(shell, orient=tk.VERTICAL, command=self.dashboard_canvas.yview)
        scrollbar.grid(row=0, column=1, sticky="ns")
        self.dashboard_canvas.configure(yscrollcommand=scrollbar.set)

        root = tk.Frame(self.dashboard_canvas, bg=self.colors["bg"])
        root.grid_columnconfigure(0, weight=7)
        root.grid_columnconfigure(1, weight=4)
        root.grid_rowconfigure(2, weight=1)
        self.canvas_window_id = self.dashboard_canvas.create_window((0, 0), window=root, anchor="nw")
        root.bind("<Configure>", self._sync_scroll_region)
        self.dashboard_canvas.bind("<Configure>", self._sync_canvas_width)
        self._bind_mousewheel(self.dashboard_canvas)
        self._bind_mousewheel(root)

        header = tk.Frame(root, bg=self.colors["panel"], highlightthickness=1, highlightbackground=self.colors["line"])
        header.grid(row=0, column=0, columnspan=2, sticky="ew", padx=18, pady=(18, 10))
        tk.Label(
            header,
            text="Tenadam Local Stack Admin",
            font=("Segoe UI Semibold", 22),
            fg=self.colors["text"],
            bg=self.colors["panel"],
        ).pack(anchor="w", padx=18, pady=(16, 2))
        tk.Label(
            header,
            text="Unified control center for backend services, portals, and secure public tunnel access.",
            font=("Segoe UI", 10),
            fg=self.colors["muted"],
            bg=self.colors["panel"],
        ).pack(anchor="w", padx=18, pady=(0, 4))
        tk.Label(
            header,
            text=f"Repo: {self.repo_root}",
            font=("Consolas", 9),
            fg="#7dd3fc",
            bg=self.colors["panel"],
        ).pack(anchor="w", padx=18, pady=(0, 16))

        hero = tk.Frame(root, bg=self.colors["bg"])
        hero.grid(row=1, column=0, columnspan=2, sticky="ew", padx=18, pady=(4, 12))
        hero.grid_columnconfigure((0, 1, 2, 3), weight=1)
        self.summary_metric_vars = {
            "online": tk.StringVar(value="0 / 9"),
            "tunnels": tk.StringVar(value="0 live"),
            "network": tk.StringVar(value=self.local_ip),
            "mode": tk.StringVar(value="Pending"),
        }
        self._make_metric_card(hero, 0, "Services Online", self.summary_metric_vars["online"], self.colors["cyan"])
        self._make_metric_card(hero, 1, "Public Tunnels", self.summary_metric_vars["tunnels"], self.colors["violet"])
        self._make_metric_card(hero, 2, "Network IP", self.summary_metric_vars["network"], self.colors["ok"])
        self._make_metric_card(hero, 3, "Tunnel Mode", self.summary_metric_vars["mode"], self.colors["warn"])

        controls = tk.Frame(root, bg=self.colors["bg"])
        controls.grid(row=2, column=0, sticky="nsew", padx=(18, 12), pady=(0, 18))
        controls.grid_columnconfigure(0, weight=5)
        controls.grid_columnconfigure(1, weight=4)
        controls.grid_rowconfigure(1, weight=1)

        upper = tk.Frame(controls, bg=self.colors["bg"])
        upper.grid(row=0, column=0, columnspan=2, sticky="ew", pady=(0, 12))
        upper.grid_columnconfigure((0, 1, 2), weight=1)

        card_stack = self._make_card(upper)
        card_stack.grid(row=0, column=0, sticky="nsew", padx=(0, 8))
        tk.Label(card_stack, text="Stack Controls", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(card_stack, text="Launch, stop, and recover the local platform without hopping between terminals.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=320, justify="left").pack(anchor="w", pady=(0, 10))
        row1 = tk.Frame(card_stack, bg=self.colors["panel2"])
        row1.pack(fill=tk.X, pady=2)
        self._make_button(row1, "Start Backend", self.start_backend, self.colors["cyan"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row1, "Stop Backend", self.stop_backend, self.colors["slate"]).pack(side=tk.LEFT, padx=3)
        row2 = tk.Frame(card_stack, bg=self.colors["panel2"])
        row2.pack(fill=tk.X, pady=2)
        self._make_button(row2, "Start Frontend", self.start_frontend, self.colors["ok"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row2, "Stop Frontend", self.stop_frontend, self.colors["slate"]).pack(side=tk.LEFT, padx=3)
        row3 = tk.Frame(card_stack, bg=self.colors["panel2"])
        row3.pack(fill=tk.X, pady=2)
        self._make_button(row3, "Restart All", self.restart_all, self.colors["warn"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row3, "Stop All", self.stop_all, self.colors["danger"]).pack(side=tk.LEFT, padx=3)

        card_tunnels = self._make_card(upper)
        card_tunnels.grid(row=0, column=1, sticky="nsew", padx=8)
        tk.Label(card_tunnels, text="Tunnel Controls", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(card_tunnels, textvariable=self.ngrok_mode_var, font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=320, justify="left").pack(anchor="w", pady=(0, 10))
        row4 = tk.Frame(card_tunnels, bg=self.colors["panel2"])
        row4.pack(fill=tk.X, pady=2)
        self._make_button(row4, "Start Patient", self.start_ngrok_patient, self.colors["violet"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row4, "Stop Patient", self.stop_ngrok_patient, self.colors["slate"]).pack(side=tk.LEFT, padx=3)
        row5 = tk.Frame(card_tunnels, bg=self.colors["panel2"])
        row5.pack(fill=tk.X, pady=2)
        self._make_button(row5, "Start Org", self.start_ngrok_org, self.colors["violet"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row5, "Stop Org", self.stop_ngrok_org, self.colors["slate"]).pack(side=tk.LEFT, padx=3)
        row6 = tk.Frame(card_tunnels, bg=self.colors["panel2"])
        row6.pack(fill=tk.X, pady=2)
        self._make_button(row6, "Open Patient Public", self.open_patient_ngrok_url, self.colors["blue"]).pack(side=tk.LEFT, padx=3)
        self._make_button(row6, "Open Org Public", self.open_org_ngrok_url, "#1d4ed8").pack(side=tk.LEFT, padx=3)

        card_local = self._make_card(upper)
        card_local.grid(row=0, column=2, sticky="nsew", padx=(8, 0))
        tk.Label(card_local, text="Access Points", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(card_local, textvariable=self.status_summary_var, font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=320, justify="left").pack(anchor="w", pady=(0, 10))
        self._make_button(card_local, "Open Local Patient", self.open_local_patient_url, "#0891b2").pack(anchor="w", pady=2)
        self._make_button(card_local, "Open Local Org", self.open_local_org_url, "#0369a1").pack(anchor="w", pady=2)
        self._make_info_row(card_local, "Patient LAN", self.local_patient_url_var, "#67e8f9")
        self._make_info_row(card_local, "Organization LAN", self.local_org_url_var, "#7dd3fc")
        self._make_info_row(card_local, "Patient Public", self.ngrok_patient_url_var, "#c4b5fd")
        self._make_info_row(card_local, "Organization Public", self.ngrok_org_url_var, "#bfdbfe")

        bottom_left = tk.Frame(controls, bg=self.colors["bg"])
        bottom_left.grid(row=1, column=0, sticky="nsew", padx=(0, 12))
        bottom_left.grid_rowconfigure(1, weight=1)
        bottom_left.grid_columnconfigure(0, weight=1)

        status_card = self._make_card(bottom_left)
        status_card.grid(row=0, column=0, sticky="ew", pady=(0, 12))
        tk.Label(status_card, text="Service Mesh", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(status_card, text="Live port health across portals, API, LiveKit, and ngrok diagnostics.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 10))
        for service, port in PORTS.items():
            row = tk.Frame(status_card, bg=self.colors["panel2"], highlightthickness=1, highlightbackground=self.colors["line"])
            row.pack(fill=tk.X, pady=3)
            tk.Label(row, text=service, font=("Segoe UI", 10, "bold"), fg="#dbe7f5", bg=self.colors["panel2"]).pack(side=tk.LEFT, padx=10, pady=10)
            tk.Label(row, text=f"Port {port}", font=("Consolas", 9), fg=self.colors["muted"], bg=self.colors["panel2"]).pack(side=tk.LEFT, padx=(0, 8))
            badge = tk.Label(row, text="CHECKING", font=("Segoe UI", 9, "bold"), fg="#08111d", bg="#9ca3af", padx=12, pady=4)
            badge.pack(side=tk.RIGHT, padx=10)
            self.port_badges[service] = badge

        log_card = self._make_card(bottom_left)
        log_card.grid(row=1, column=0, sticky="nsew")
        tk.Label(log_card, text="Activity Stream", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(log_card, text="Background process output and stack actions land here without freezing the interface.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 10))
        self.log_text = tk.Text(
            log_card,
            bg=self.colors["surface"],
            fg="#e2e8f0",
            insertbackground="#e2e8f0",
            relief=tk.FLAT,
            wrap=tk.WORD,
            height=16,
            bd=0,
            padx=14,
            pady=14,
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)

        right = tk.Frame(root, bg=self.colors["bg"])
        right.grid(row=2, column=1, sticky="nsew", padx=(0, 18), pady=(0, 18))
        right.grid_rowconfigure(2, weight=1)
        right.grid_columnconfigure(0, weight=1)

        token_card = self._make_card(right)
        token_card.grid(row=0, column=0, sticky="ew", pady=(0, 12))
        tk.Label(token_card, text="ngrok Identity", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(token_card, text="Store separate patient and organization ngrok tokens locally. The file stays ignored by git.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=360, justify="left").pack(anchor="w", pady=(0, 12))
        self._make_entry(token_card, "Patient token", self.patient_token_var)
        self._make_entry(token_card, "Organization token", self.org_token_var)
        token_actions = tk.Frame(token_card, bg=self.colors["panel2"])
        token_actions.pack(fill=tk.X, pady=(8, 0))
        self._make_button(token_actions, "Save Tokens", self.save_ngrok_tokens, self.colors["violet"]).pack(side=tk.LEFT, padx=(0, 8))
        self._make_button(token_actions, "Help", self.reveal_token_help, self.colors["slate"]).pack(side=tk.LEFT)

        workspace_card = self._make_card(right)
        workspace_card.grid(row=1, column=0, sticky="ew", pady=(0, 12))
        tk.Label(workspace_card, text="Workspace Tools", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(workspace_card, text="Open the folders you reach for most while testing, debugging, or checking logs.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=360, justify="left").pack(anchor="w", pady=(0, 12))
        workspace_actions = tk.Frame(workspace_card, bg=self.colors["panel2"])
        workspace_actions.pack(fill=tk.X)
        self._make_button(workspace_actions, "Open Logs", self.open_logs_dir, self.colors["cyan"]).pack(side=tk.LEFT, padx=(0, 8))
        self._make_button(workspace_actions, "Open Repo", self.open_repo_root, self.colors["slate"]).pack(side=tk.LEFT)
        self._make_info_row(workspace_card, "Logs folder", tk.StringVar(value=str(self.logs_dir)), "#a5f3fc")
        self._make_info_row(workspace_card, "Local env file", tk.StringVar(value=str(self.dashboard_env_path)), "#bfdbfe")

        right_info = self._make_card(right)
        right_info.grid(row=2, column=0, sticky="nsew")
        tk.Label(right_info, text="Public Exposure", font=("Segoe UI Semibold", 12), fg=self.colors["text"], bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 6))
        tk.Label(right_info, text="Monitor public links and confirm which ngrok mode the dashboard is running.", font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel2"], wraplength=360, justify="left").pack(anchor="w", pady=(0, 12))
        self._make_info_row(right_info, "Patient HTTPS", self.ngrok_patient_url_var, "#93c5fd")
        self._make_info_row(right_info, "Organization HTTPS", self.ngrok_org_url_var, "#93c5fd")
        self._make_info_row(right_info, "Current mode", self.ngrok_mode_var, "#fde68a")

        self.log("Dashboard initialized.")
        self.protocol("WM_DELETE_WINDOW", self.on_close)

    def _make_card(self, parent: tk.Widget) -> tk.Frame:
        return tk.Frame(parent, bg=self.colors["panel2"], padx=14, pady=14, highlightthickness=1, highlightbackground=self.colors["line"])

    def _sync_scroll_region(self, _event=None) -> None:
        self.dashboard_canvas.configure(scrollregion=self.dashboard_canvas.bbox("all"))

    def _sync_canvas_width(self, event) -> None:
        if self.canvas_window_id is None:
            return
        width = max(event.width - 2, 900)
        self.dashboard_canvas.itemconfigure(self.canvas_window_id, width=width)

    def _bind_mousewheel(self, widget: tk.Widget) -> None:
        widget.bind("<MouseWheel>", self._on_mousewheel, add="+")
        widget.bind("<Button-4>", self._on_mousewheel_linux, add="+")
        widget.bind("<Button-5>", self._on_mousewheel_linux, add="+")

    def _on_mousewheel(self, event) -> str:
        delta = 0
        if event.delta > 0:
            delta = -1
        elif event.delta < 0:
            delta = 1
        if delta:
            self.dashboard_canvas.yview_scroll(delta, "units")
        return "break"

    def _on_mousewheel_linux(self, event) -> str:
        if event.num == 4:
            self.dashboard_canvas.yview_scroll(-1, "units")
        elif event.num == 5:
            self.dashboard_canvas.yview_scroll(1, "units")
        return "break"

    def _make_metric_card(self, parent: tk.Widget, column: int, title: str, value_var: tk.StringVar, accent: str) -> None:
        card = tk.Frame(parent, bg=self.colors["panel"], padx=14, pady=14, highlightthickness=1, highlightbackground=self.colors["line"])
        card.grid(row=0, column=column, sticky="ew", padx=(0 if column == 0 else 6, 0 if column == 3 else 6))
        tk.Frame(card, bg=accent, height=4).pack(fill=tk.X, pady=(0, 12))
        tk.Label(card, text=title, font=("Segoe UI", 9), fg=self.colors["muted"], bg=self.colors["panel"]).pack(anchor="w")
        tk.Label(card, textvariable=value_var, font=("Segoe UI Semibold", 18), fg=self.colors["text"], bg=self.colors["panel"]).pack(anchor="w", pady=(8, 0))

    def _make_info_row(self, parent: tk.Widget, label: str, value_var: tk.StringVar, value_color: str) -> None:
        row = tk.Frame(parent, bg=self.colors["panel2"], highlightthickness=1, highlightbackground=self.colors["line"])
        row.pack(fill=tk.X, pady=4)
        tk.Label(row, text=label, font=("Segoe UI", 9, "bold"), fg="#dbe7f5", bg=self.colors["panel2"]).pack(anchor="w", padx=10, pady=(8, 2))
        tk.Label(row, textvariable=value_var, font=("Consolas", 9), fg=value_color, bg=self.colors["panel2"], wraplength=340, justify="left").pack(anchor="w", padx=10, pady=(0, 8))

    def _make_entry(self, parent: tk.Widget, label: str, value_var: tk.StringVar) -> None:
        wrapper = tk.Frame(parent, bg=self.colors["panel2"])
        wrapper.pack(fill=tk.X, pady=4)
        tk.Label(wrapper, text=label, font=("Segoe UI", 9, "bold"), fg="#dbe7f5", bg=self.colors["panel2"]).pack(anchor="w", pady=(0, 4))
        entry = tk.Entry(
            wrapper,
            textvariable=value_var,
            show="*",
            bg=self.colors["surface"],
            fg=self.colors["text"],
            insertbackground=self.colors["text"],
            relief=tk.FLAT,
            bd=0,
            font=("Consolas", 10),
        )
        entry.pack(fill=tk.X, ipady=8)

    def _make_button(self, parent: tk.Widget, text: str, command, bg: str) -> tk.Button:
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=("Segoe UI Semibold", 9),
            bg=bg,
            fg="#ffffff",
            activebackground=bg,
            activeforeground="#ffffff",
            relief=tk.FLAT,
            bd=0,
            padx=10,
            pady=8,
            cursor="hand2",
        )

        def _darken(hex_color: str, factor: float = 0.85) -> str:
            color = hex_color.lstrip("#")
            r = int(color[0:2], 16)
            g = int(color[2:4], 16)
            b = int(color[4:6], 16)
            r = max(0, min(255, int(r * factor)))
            g = max(0, min(255, int(g * factor)))
            b = max(0, min(255, int(b * factor)))
            return f"#{r:02x}{g:02x}{b:02x}"

        hover_bg = _darken(bg, 0.82)
        btn.bind("<Enter>", lambda _e: btn.config(bg=hover_bg, activebackground=hover_bg))
        btn.bind("<Leave>", lambda _e: btn.config(bg=bg, activebackground=bg))
        return btn

    def log(self, message: str) -> None:
        if not hasattr(self, "log_text"):
            self._pre_ui_logs.append(message)
            return
        timestamp = time.strftime("%H:%M:%S")
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)

    def _flush_pre_ui_logs(self) -> None:
        if not hasattr(self, "log_text") or not self._pre_ui_logs:
            return
        for message in self._pre_ui_logs:
            timestamp = time.strftime("%H:%M:%S")
            self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)
        self._pre_ui_logs.clear()

    @staticmethod
    def port_open(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.3)
            return sock.connect_ex(("127.0.0.1", port)) == 0

    def _schedule_port_refresh(self) -> None:
        if not self.port_scan_active:
            self.port_scan_active = True

            def _worker() -> None:
                statuses = {service: self.port_open(port) for service, port in PORTS.items()}
                self.after(0, lambda: self._apply_port_refresh(statuses))

            threading.Thread(target=_worker, daemon=True).start()
        self.after(3000, self._schedule_port_refresh)

    def _apply_port_refresh(self, statuses: dict[str, bool]) -> None:
        self.port_scan_active = False
        self.port_statuses = statuses

        online_count = 0
        for service, is_open in statuses.items():
            badge = self.port_badges[service]
            if is_open:
                badge.config(text="RUNNING", bg=self.colors["ok"], fg="#052e16")
                online_count += 1
            else:
                badge.config(text="STOPPED", bg=self.colors["danger"], fg="#3d0911")

        self.summary_metric_vars["online"].set(f"{online_count} / {len(PORTS)}")
        self._refresh_summary_banner()

    def _refresh_summary_banner(self) -> None:
        patient_up = self.port_statuses.get("Patient Portal", False)
        org_up = self.port_statuses.get("Org Portal", False)
        gateway_up = self.port_statuses.get("API Gateway", False)

        tunnel_count = sum(
            1
            for value in (self.ngrok_patient_url_var.get().strip(), self.ngrok_org_url_var.get().strip())
            if value.startswith("http")
        )
        self.summary_metric_vars["tunnels"].set(f"{tunnel_count} live")

        mode_text = self.ngrok_mode_var.get().lower()
        if "dual-account" in mode_text:
            self.summary_metric_vars["mode"].set("Dual")
        elif "shared-token" in mode_text:
            self.summary_metric_vars["mode"].set("Shared")
        elif "missing" in mode_text:
            self.summary_metric_vars["mode"].set("Missing")
        else:
            self.summary_metric_vars["mode"].set("Ready")

        if patient_up and org_up and gateway_up:
            self.status_summary_var.set("Core services are online and ready for local testing.")
        elif patient_up or org_up or gateway_up:
            self.status_summary_var.set("The stack is partially online. You can keep launching the remaining services from here.")
        else:
            self.status_summary_var.set("The stack is idle. Start backend and frontend services to begin a full local session.")

    def run_command(self, cmd: list[str], label: str, env_overrides: dict[str, str] | None = None) -> None:
        def _worker() -> None:
            try:
                self.log(f"{label}: {' '.join(cmd)}")
                env = os.environ.copy()
                if env_overrides:
                    env.update(env_overrides)
                result = subprocess.run(
                    cmd,
                    cwd=self.repo_root,
                    capture_output=True,
                    text=True,
                    check=False,
                    env=env,
                )
                if result.stdout.strip():
                    self.log(result.stdout.strip())
                if result.stderr.strip():
                    self.log(result.stderr.strip())
                if result.returncode == 0:
                    self.log(f"{label}: done")
                else:
                    self.log(f"{label}: failed (exit {result.returncode})")
            except Exception as exc:
                self.log(f"{label}: error ({exc})")

        threading.Thread(target=_worker, daemon=True).start()

    def start_backend(self) -> None:
        backend_env = {
            "LIVEKIT_NODE_IP": self.local_ip,
            "LIVEKIT_PUBLIC_URL": f"ws://{self.local_ip}:7880",
        }
        self.run_command(
            [self.docker_bin, "compose", "up", "-d", "postgres", "redis", "livekit", "api-gateway", "front-door", "pgadmin"],
        "Start backend",
            env_overrides=backend_env,
        )

    def stop_backend(self) -> None:
        self.run_command([self.docker_bin, "compose", "stop", "api-gateway", "livekit", "redis", "postgres", "front-door", "pgadmin"], "Stop backend")

    def _start_managed_process(self, key: str) -> None:
        managed = self.processes.get(key)
        if not managed:
            return

        # 1. Strict Liveness Check: Don't start if already running
        if managed.process is not None:
            if managed.process.poll() is None:
                self.log(f"{managed.name} is already active (pid {managed.process.pid}).")
                return
            else:
                # Cleanup reference to dead process
                managed.process = None

        # 2. Setup Logging
        log_path = self.logs_dir / f"{key}.log"
        managed.log_path = log_path
        
        try:
            # Open in append mode with encoding
            log_file = open(log_path, "a", encoding="utf-8")
            managed.log_file = log_file
            
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            log_file.write(f"\n--- SESSION START: {timestamp} ---\n")
            log_file.flush()

            # 3. Process Execution Flags
            # Using CREATE_NO_WINDOW is more stable for ngrok background tasks on Windows
            creation_flags = 0
            if os.name == "nt":
                creation_flags = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP

            managed.process = subprocess.Popen(
                managed.command,
                cwd=managed.cwd,
                env=self._process_env(key),
                stdout=log_file,
                stderr=subprocess.STDOUT,
                creationflags=creation_flags,
            )
            
            self.log(f"Started {managed.name} (pid {managed.process.pid})")
            
        except FileNotFoundError:
            if managed.log_file:
                managed.log_file.close()
            managed.process = None
            managed.log_file = None
            self.log(f"Error: Executable not found for {managed.name} ({managed.command[0]})")
        except Exception as exc:
            if managed.log_file:
                managed.log_file.close()
            managed.process = None
            managed.log_file = None
            self.log(f"Critical failure starting {managed.name}: {exc}")

    def _stop_managed_process(self, key: str) -> None:
        managed = self.processes[key]
        process = managed.process
        if process is None or process.poll() is not None:
            self.log(f"{managed.name} is not running.")
            return

        try:
            if os.name == "nt":
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], check=False, capture_output=True)
            else:
                os.kill(process.pid, signal.SIGTERM)
            self.log(f"Stopped {managed.name} (pid {process.pid})")
        finally:
            managed.process = None
            if managed.log_file is not None:
                try:
                    managed.log_file.close()
                except Exception:
                    pass
                managed.log_file = None

    def start_frontend(self) -> None:
        self._start_managed_process("patient")
        self._start_managed_process("org")
        self._start_managed_process("registration")
        self._start_managed_process("superadmin")

    def stop_frontend(self) -> None:
        self._stop_managed_process("patient")
        self._stop_managed_process("org")
        self._stop_managed_process("registration")
        self._stop_managed_process("superadmin")

    def restart_all(self) -> None:
        self.stop_frontend()
        self.stop_ngrok()
        self.stop_backend()
        self.after(1500, self.start_backend)
        self.after(3000, self.start_frontend)

    def stop_all(self) -> None:
        self.stop_frontend()
        self.stop_ngrok()
        self.stop_backend()

    def start_ngrok_patient(self) -> None:
        self._configure_ngrok_processes()
        if "ngrok_patient" in self.processes:
            self._start_managed_process("ngrok_patient")
            return
        self.start_ngrok()

    def stop_ngrok_patient(self) -> None:
        if "ngrok_patient" in self.processes:
            self._stop_managed_process("ngrok_patient")
            self.ngrok_patient_url_var.set("Not running")
            self._refresh_summary_banner()
            return
        self.stop_ngrok()

    def start_ngrok_org(self) -> None:
        self._configure_ngrok_processes()
        if "ngrok_org" in self.processes:
            self._start_managed_process("ngrok_org")
            return
        self.start_ngrok()

    def stop_ngrok_org(self) -> None:
        if "ngrok_org" in self.processes:
            self._stop_managed_process("ngrok_org")
            self.ngrok_org_url_var.set("Not running")
            self._refresh_summary_banner()
            return
        self.stop_ngrok()

    def start_ngrok(self) -> None:
        self._configure_ngrok_processes()

        if "ngrok_patient" in self.processes and "ngrok_org" in self.processes:
            self._start_managed_process("ngrok_patient")
            self._start_managed_process("ngrok_org")
            return

        if "ngrok" not in self.processes:
            self.log("ngrok is not installed or not found in PATH.")
            return

        self._start_managed_process("ngrok")

    def stop_ngrok(self) -> None:
        if "ngrok_patient" in self.processes:
            self._stop_managed_process("ngrok_patient")
        if "ngrok_org" in self.processes:
            self._stop_managed_process("ngrok_org")
        if "ngrok" in self.processes:
            self._stop_managed_process("ngrok")
        self.ngrok_patient_url_var.set("Not running")
        self.ngrok_org_url_var.set("Not running")
        self._refresh_summary_banner()

    def _get_ngrok_public_url(self, target_port: int) -> str | None:
        for api_port in (4040, 4041):
            try:
                with urllib_request.urlopen(f"http://127.0.0.1:{api_port}/api/tunnels", timeout=1.0) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                tunnels = payload.get("tunnels", [])
                for tunnel in tunnels:
                    public_url = str(tunnel.get("public_url") or "")
                    addr = str((tunnel.get("config") or {}).get("addr") or "")
                    if public_url.startswith("https://") and (f":{target_port}" in addr or addr.endswith(str(target_port))):
                        return public_url
            except Exception:
                continue
        return None

    def _schedule_ngrok_refresh(self) -> None:
        if not self.ngrok_scan_active:
            self.ngrok_scan_active = True

            def _worker() -> None:
                patient_url = self._get_ngrok_public_url(3000)
                org_url = self._get_ngrok_public_url(4000)
                self.after(0, lambda: self._apply_ngrok_refresh(patient_url, org_url))

            threading.Thread(target=_worker, daemon=True).start()
        self.after(4000, self._schedule_ngrok_refresh)

    def _apply_ngrok_refresh(self, patient_url: str | None, org_url: str | None) -> None:
        self.ngrok_scan_active = False

        ngrok_proc = self.processes.get("ngrok")
        ngrok_running = bool(ngrok_proc and ngrok_proc.process and ngrok_proc.process.poll() is None)
        ngrok_patient_proc = self.processes.get("ngrok_patient")
        ngrok_org_proc = self.processes.get("ngrok_org")
        ngrok_patient_running = bool(ngrok_patient_proc and ngrok_patient_proc.process and ngrok_patient_proc.process.poll() is None)
        ngrok_org_running = bool(ngrok_org_proc and ngrok_org_proc.process and ngrok_org_proc.process.poll() is None)

        patient_starting = ngrok_running or ngrok_patient_running
        org_starting = ngrok_running or ngrok_org_running

        self.ngrok_patient_url_var.set(patient_url if patient_url else ("Starting..." if patient_starting else "Not running"))
        self.ngrok_org_url_var.set(org_url if org_url else ("Starting..." if org_starting else "Not running"))
        self._refresh_summary_banner()

    def open_patient_ngrok_url(self) -> None:
        live_url = self._get_ngrok_public_url(3000)
        url = live_url or self.ngrok_patient_url_var.get().strip()
        if not url.startswith("http"):
            self.log("No patient ngrok URL available yet.")
            return
        webbrowser.open(url)
        self.log(f"Opened patient public URL: {url}")

    def open_org_ngrok_url(self) -> None:
        live_url = self._get_ngrok_public_url(4000)
        url = live_url or self.ngrok_org_url_var.get().strip()
        if not url.startswith("http"):
            self.log("No org ngrok URL available yet.")
            return
        webbrowser.open(url)
        self.log(f"Opened org public URL: {url}")

    def open_local_patient_url(self) -> None:
        webbrowser.open(self.local_patient_url)
        self.log(f"Opened local patient URL: {self.local_patient_url}")

    def open_local_org_url(self) -> None:
        webbrowser.open(self.local_org_url)
        self.log(f"Opened local org URL: {self.local_org_url}")

    def _open_path(self, path: Path) -> None:
        try:
            if os.name == "nt":
                os.startfile(str(path))
            else:
                webbrowser.open(path.as_uri())
            self.log(f"Opened path: {path}")
        except Exception as exc:
            self.log(f"Could not open path {path}: {exc}")

    def open_logs_dir(self) -> None:
        self._open_path(self.logs_dir)

    def open_repo_root(self) -> None:
        self._open_path(self.repo_root)

    def on_close(self) -> None:
        if messagebox.askyesno("Exit", "Stop frontend processes before exiting?"):
            self.stop_frontend()
            self.stop_ngrok()
        self.destroy()


def main() -> int:
    app = StackDashboard()
    app.mainloop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
