import re

path = 'dashboard.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# _ngrok_tokens
content = content.replace(
    'return p_tok, o_tok, s_tok',
    'sa_tok = os.environ.get("NGROK_AUTHTOKEN_SUPERADMIN", "").strip()\n        r_tok = os.environ.get("NGROK_AUTHTOKEN_REGISTRATION", "").strip()\n        return p_tok, o_tok, sa_tok, r_tok, s_tok'
)

# _configure_ngrok_processes old signature
config_method_old = '''    def _configure_ngrok_processes(self) -> None:
        for key in ("ngrok", "ngrok_patient", "ngrok_org"):
            self.processes.pop(key, None)

        self._ngrok_mode_note = ""

        if not shutil.which(self.ngrok_bin):
            self.ngrok_mode_var.set("ngrok CLI not found in PATH")
            return

        patient_token, org_token, _shared_token = self._ngrok_tokens()'''

config_method_new = '''    def _configure_ngrok_processes(self) -> None:
        for key in ("ngrok", "ngrok_patient", "ngrok_org", "ngrok_superadmin", "ngrok_registration"):
            self.processes.pop(key, None)

        self._ngrok_mode_note = ""

        if not shutil.which(self.ngrok_bin):
            self.ngrok_mode_var.set("ngrok CLI not found in PATH")
            return

        patient_token, org_token, sa_token, reg_token, _shared_token = self._ngrok_tokens()'''

content = content.replace(config_method_old, config_method_new)

# Add superadmin and registration configs
content = re.sub(
    r'self.ngrok_runtime_config_org = self.config_dir / "ngrok-org.yml"',
    'self.ngrok_runtime_config_org = self.config_dir / "ngrok-org.yml"\n        self.ngrok_runtime_config_superadmin = self.config_dir / "ngrok-superadmin.yml"\n        self.ngrok_runtime_config_registration = self.config_dir / "ngrok-registration.yml"',
    content
)

# Update config creation logic
content = re.sub(
    r'self.processes\["ngrok_org"\] = ManagedProcess\((.*?)\n\s+cwd=self.repo_root,\n\s+\)',
    r'''self.processes["ngrok_org"] = ManagedProcess(\1
                cwd=self.repo_root,
            )
            if sa_token:
                sa_config_args = self._build_ngrok_config_args(config_path=self.ngrok_runtime_config_superadmin, authtoken=sa_token, web_addr="127.0.0.1:4042", include_patient=False, include_org=False, include_superadmin=True)
                self.processes["ngrok_superadmin"] = ManagedProcess(name="ngrok (Super Admin)", command=[self.ngrok_bin, "start", "superadmin-tunnel", *sa_config_args, "--log", "stdout"], cwd=self.repo_root)
            if reg_token:
                reg_config_args = self._build_ngrok_config_args(config_path=self.ngrok_runtime_config_registration, authtoken=reg_token, web_addr="127.0.0.1:4043", include_patient=False, include_org=False, include_registration=True)
                self.processes["ngrok_registration"] = ManagedProcess(name="ngrok (Registration)", command=[self.ngrok_bin, "start", "registration-tunnel", *reg_config_args, "--log", "stdout"], cwd=self.repo_root)''',
    content,
    flags=re.DOTALL
)

# Update start_ngrok
content = content.replace(
    '''            self._start_managed_process("ngrok_patient")
            self._start_managed_process("ngrok_org")
            return''',
    '''            self._start_managed_process("ngrok_patient")
            self._start_managed_process("ngrok_org")
            if "ngrok_superadmin" in self.processes: self._start_managed_process("ngrok_superadmin")
            if "ngrok_registration" in self.processes: self._start_managed_process("ngrok_registration")
            return'''
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
