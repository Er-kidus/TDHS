import json
import time
import tkinter as tk
from dataclasses import dataclass
from tkinter import messagebox
from tkinter import scrolledtext
from urllib import error, request


@dataclass
class ActorConfig:
    name: str
    auth_required: bool


ACTORS = [
    ActorConfig("public", False),
    ActorConfig("patient", True),
    ActorConfig("org-admin", True),
    ActorConfig("superadmin", True),
]

DEFAULT_ENDPOINTS = [
    # Organization registration flow
    "/org/auth/register",
    "/org/auth/login",
    "/org/applications",
    "/org/application/me",
    "/org/configuration/me",
    "/org/service-management/me",

    # General health and operations
    "/health",
    "/organizations",
    "/org/hospitals",
    "/auth/login",
    "/patients/me",
    "/appointments?limit=20",
    "/org/me",
    "/org/organizations",
    "/org/users?limit=50",
]


class EndpointTester(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Tenadam Backend Endpoint Tester")
        self.geometry("1200x760")
        self.configure(bg="#0f172a")

        self.base_url_var = tk.StringVar(value="http://localhost:8000")
        self.method_var = tk.StringVar(value="GET")
        self.endpoint_var = tk.StringVar(value=DEFAULT_ENDPOINTS[0])
        self.actor_var = tk.StringVar(value="public")

        self.token_vars: dict[str, tk.StringVar] = {
            actor.name: tk.StringVar(value="") for actor in ACTORS if actor.auth_required
        }

        self._build_ui()

    def _build_ui(self) -> None:
        top = tk.Frame(self, bg="#111827")
        top.pack(fill=tk.X, padx=14, pady=(14, 8))

        tk.Label(top, text="Tenadam Backend Endpoint Tester", font=("Segoe UI", 16, "bold"), fg="#f8fafc", bg="#111827").grid(row=0, column=0, columnspan=6, sticky="w", padx=10, pady=(10, 2))
        tk.Label(top, text="Quickly test endpoints with actor-specific Authorization tokens.", font=("Segoe UI", 10), fg="#94a3b8", bg="#111827").grid(row=1, column=0, columnspan=6, sticky="w", padx=10, pady=(0, 10))

        form = tk.Frame(self, bg="#0f172a")
        form.pack(fill=tk.X, padx=14, pady=(0, 8))

        self._label(form, "Base URL").grid(row=0, column=0, sticky="w")
        tk.Entry(form, textvariable=self.base_url_var, width=42, bg="#111827", fg="#e2e8f0", insertbackground="#e2e8f0", relief=tk.FLAT).grid(row=1, column=0, padx=(0, 8), sticky="we")

        self._label(form, "Method").grid(row=0, column=1, sticky="w")
        tk.OptionMenu(form, self.method_var, "GET", "POST", "PUT", "PATCH", "DELETE").grid(row=1, column=1, padx=(0, 8), sticky="we")

        self._label(form, "Endpoint").grid(row=0, column=2, sticky="w")
        endpoint_menu = tk.OptionMenu(form, self.endpoint_var, *DEFAULT_ENDPOINTS)
        endpoint_menu.grid(row=1, column=2, padx=(0, 8), sticky="we")

        self._label(form, "Actor").grid(row=0, column=3, sticky="w")
        tk.OptionMenu(form, self.actor_var, *[actor.name for actor in ACTORS], command=lambda _: self._refresh_token_preview()).grid(row=1, column=3, padx=(0, 8), sticky="we")

        tk.Button(form, text="Send Request", command=self.send_request, bg="#22c55e", fg="white", relief=tk.FLAT, font=("Segoe UI", 10, "bold"), padx=12, pady=8).grid(row=1, column=4, padx=(4, 8), sticky="we")
        tk.Button(form, text="Clear Output", command=self.clear_output, bg="#475569", fg="white", relief=tk.FLAT, font=("Segoe UI", 10, "bold"), padx=12, pady=8).grid(row=1, column=5, sticky="we")

        for col in range(6):
            form.grid_columnconfigure(col, weight=1)

        token_card = tk.Frame(self, bg="#111827")
        token_card.pack(fill=tk.X, padx=14, pady=(0, 8))

        tk.Label(token_card, text="Actor Tokens", font=("Segoe UI", 11, "bold"), fg="#f8fafc", bg="#111827").grid(row=0, column=0, columnspan=2, sticky="w", padx=10, pady=(8, 2))
        tk.Label(token_card, text="Paste JWTs once, then switch actors while testing.", font=("Segoe UI", 9), fg="#94a3b8", bg="#111827").grid(row=1, column=0, columnspan=2, sticky="w", padx=10, pady=(0, 8))

        row = 2
        for actor in ACTORS:
            if not actor.auth_required:
                continue
            tk.Label(token_card, text=f"{actor.name} token", fg="#cbd5e1", bg="#111827", font=("Segoe UI", 9, "bold")).grid(row=row, column=0, sticky="w", padx=10, pady=(0, 4))
            tk.Entry(token_card, textvariable=self.token_vars[actor.name], width=120, show="", bg="#020617", fg="#e2e8f0", insertbackground="#e2e8f0", relief=tk.FLAT).grid(row=row, column=1, sticky="we", padx=(0, 10), pady=(0, 4))
            row += 1

        token_card.grid_columnconfigure(1, weight=1)

        body_frame = tk.Frame(self, bg="#111827")
        body_frame.pack(fill=tk.BOTH, expand=True, padx=14, pady=(0, 14))

        tk.Label(body_frame, text="Request JSON Body", font=("Segoe UI", 10, "bold"), fg="#f8fafc", bg="#111827").grid(row=0, column=0, sticky="w", padx=10, pady=(10, 4))
        tk.Label(body_frame, text="Response", font=("Segoe UI", 10, "bold"), fg="#f8fafc", bg="#111827").grid(row=0, column=1, sticky="w", padx=10, pady=(10, 4))

        self.request_body = scrolledtext.ScrolledText(body_frame, height=18, bg="#020617", fg="#e2e8f0", insertbackground="#e2e8f0", relief=tk.FLAT, wrap=tk.WORD)
        self.request_body.grid(row=1, column=0, sticky="nsew", padx=(10, 6), pady=(0, 10))
        self.request_body.insert("1.0", "{}")

        self.output = scrolledtext.ScrolledText(body_frame, height=18, bg="#020617", fg="#e2e8f0", insertbackground="#e2e8f0", relief=tk.FLAT, wrap=tk.WORD)
        self.output.grid(row=1, column=1, sticky="nsew", padx=(6, 10), pady=(0, 10))

        body_frame.grid_columnconfigure(0, weight=1)
        body_frame.grid_columnconfigure(1, weight=1)
        body_frame.grid_rowconfigure(1, weight=1)

        self._refresh_token_preview()

    def _label(self, parent: tk.Widget, text: str) -> tk.Label:
        return tk.Label(parent, text=text, fg="#cbd5e1", bg="#0f172a", font=("Segoe UI", 9, "bold"))

    def _refresh_token_preview(self) -> None:
        actor = self.actor_var.get()
        if actor == "public":
            self.log("Actor set to public (no Authorization header).")
        else:
            self.log(f"Actor set to {actor} (Authorization header will be used if token is set).")

    def clear_output(self) -> None:
        self.output.delete("1.0", tk.END)

    def log(self, message: str) -> None:
        ts = time.strftime("%H:%M:%S")
        self.output.insert(tk.END, f"[{ts}] {message}\n")
        self.output.see(tk.END)

    def _normalize_url(self, base_url: str, endpoint: str) -> str:
        clean_base = base_url.rstrip("/")
        clean_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        return f"{clean_base}{clean_endpoint}"

    def send_request(self) -> None:
        base_url = self.base_url_var.get().strip()
        endpoint = self.endpoint_var.get().strip()
        method = self.method_var.get().strip().upper()
        actor = self.actor_var.get().strip()

        if not base_url or not endpoint:
            messagebox.showerror("Missing input", "Base URL and Endpoint are required.")
            return

        url = self._normalize_url(base_url, endpoint)
        headers = {"Accept": "application/json"}

        token = self.token_vars.get(actor).get().strip() if actor in self.token_vars else ""
        if token:
            headers["Authorization"] = f"Bearer {token}"

        body_text = self.request_body.get("1.0", tk.END).strip()
        payload_bytes = None

        if method in {"POST", "PUT", "PATCH", "DELETE"}:
            if body_text:
                try:
                    parsed = json.loads(body_text)
                    payload_bytes = json.dumps(parsed).encode("utf-8")
                    headers["Content-Type"] = "application/json"
                except json.JSONDecodeError as exc:
                    messagebox.showerror("Invalid JSON", f"Request body is not valid JSON: {exc}")
                    return

        req = request.Request(url=url, data=payload_bytes, method=method)
        for key, value in headers.items():
            req.add_header(key, value)

        self.log(f"{method} {url}")

        try:
            with request.urlopen(req, timeout=30) as res:
                response_body = res.read().decode("utf-8", errors="replace")
                self.log(f"Status: {res.status}")
                self.log("Headers:")
                for key, value in res.headers.items():
                    self.log(f"  {key}: {value}")
                self.log("Body:")
                self.log(response_body)
                self.log("-" * 60)
        except error.HTTPError as exc:
            response_body = exc.read().decode("utf-8", errors="replace")
            self.log(f"HTTPError: {exc.code}")
            self.log("Body:")
            self.log(response_body)
            self.log("-" * 60)
        except Exception as exc:
            self.log(f"Request failed: {exc}")
            self.log("-" * 60)


def main() -> None:
    app = EndpointTester()
    app.mainloop()


if __name__ == "__main__":
    main()
