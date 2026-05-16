import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface AIModelApiRow {
  id: string;
  model_key: string;
  display_name: string;
  mode: string;
  status: string;
  version: string;
  dataset_ref: string;
  created_at: string;
  updated_at: string;
}

export interface AiManagementPageProps {
  aiModels: AIModelApiRow[];
  token: string | null;
  toast: (options: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
  pushSystemAction: (message: string) => void;
}

export default function AiManagementPage({ aiModels, token, toast, pushSystemAction }: AiManagementPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [keys, setKeys] = useState({
    gemini: "",
    groq: "",
    deepseek: "",
  });
  const [ngrokKeys, setNgrokKeys] = useState({
    patient_token: "",
    org_token: "",
    superadmin_token: "",
    registration_token: "",
  });
  const [isSavingNgrok, setIsSavingNgrok] = useState(false);
  const [currentEnvKeys, setCurrentEnvKeys] = useState({
    gemini: "",
    groq: "",
    deepseek: "",
  });

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/org/system/ai-config", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentEnvKeys({
            gemini: data.gemini || "",
            groq: data.groq || "",
            deepseek: data.deepseek || "",
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (token) {
      loadConfig();
    }
  }, [token]);

  const handleSaveKeys = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/org/system/ai-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(keys),
      });

      if (!response.ok) {
        throw new Error("Failed to save AI configuration");
      }

      toast({
        title: "Configuration Saved",
        description: "AI API keys have been updated successfully.",
      });
      pushSystemAction("Updated AI provider API keys");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNgrok = async () => {
    setIsSavingNgrok(true);
    try {
      const response = await fetch("/api/org/system/ngrok-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(ngrokKeys),
      });

      if (!response.ok) {
        throw new Error("Failed to save Ngrok configuration");
      }

      toast({
        title: "Configuration Saved",
        description: "Ngrok tokens have been updated locally.",
      });
      pushSystemAction("Updated Ngrok tunneling configuration");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSavingNgrok(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">AI Services Management</h2>
        <p className="text-sm text-muted-foreground">Manage AI models, provider API keys, and global capabilities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Keys Configuration */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">API Providers</h3>
          <p className="text-sm text-muted-foreground">Configure external AI provider API keys. Use comma-separated lists for multiple fallback keys.</p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">Google Gemini API Keys</label>
              <Input
                type="text"
                placeholder="AIzaSy..., AIzaSy..."
                value={keys.gemini}
                onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1 truncate">Current env: {currentEnvKeys.gemini ? "********" + currentEnvKeys.gemini.slice(-4) : "None"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Groq API Keys</label>
              <Input
                type="text"
                placeholder="gsk_..., gsk_..."
                value={keys.groq}
                onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1 truncate">Current env: {currentEnvKeys.groq ? "********" + currentEnvKeys.groq.slice(-4) : "None"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">DeepSeek API Keys</label>
              <Input
                type="text"
                placeholder="sk-..., sk-..."
                value={keys.deepseek}
                onChange={(e) => setKeys({ ...keys, deepseek: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1 truncate">Current env: {currentEnvKeys.deepseek ? "********" + currentEnvKeys.deepseek.slice(-4) : "None"}</p>
            </div>
            <Button className="mt-4" onClick={handleSaveKeys} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Provider Keys"}
            </Button>
          </div>
        </div>

        {/* Ngrok Tunneling */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Ngrok Tunneling</h3>
          <p className="text-sm text-muted-foreground">Configure Ngrok AuthTokens to expose portals to the public internet.</p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-sm font-medium">Patient Tunnel Token</label>
              <Input
                type="password"
                placeholder="Ngrok AuthToken for Patient portal"
                value={ngrokKeys.patient_token}
                onChange={(e) => setNgrokKeys({ ...ngrokKeys, patient_token: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Organization Tunnel Token</label>
              <Input
                type="password"
                placeholder="Ngrok AuthToken for Org portal"
                value={ngrokKeys.org_token}
                onChange={(e) => setNgrokKeys({ ...ngrokKeys, org_token: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Super Admin Tunnel Token</label>
              <Input
                type="password"
                placeholder="Ngrok AuthToken for Super Admin portal"
                value={ngrokKeys.superadmin_token}
                onChange={(e) => setNgrokKeys({ ...ngrokKeys, superadmin_token: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Registration Tunnel Token</label>
              <Input
                type="password"
                placeholder="Ngrok AuthToken for Registration portal"
                value={ngrokKeys.registration_token}
                onChange={(e) => setNgrokKeys({ ...ngrokKeys, registration_token: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button className="mt-4" onClick={handleSaveNgrok} disabled={isSavingNgrok}>
              {isSavingNgrok ? "Saving..." : "Save Ngrok Config"}
            </Button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Global AI Policies</h3>
          <p className="text-sm text-muted-foreground">Control system-wide AI behavior.</p>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">Allow Automatic Diagnosis Drafts</p>
                <p className="text-xs text-muted-foreground">Let AI draft ICD-10 codes without direct prompt.</p>
              </div>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">Strict Safety Filtering</p>
                <p className="text-xs text-muted-foreground">Block any non-medical prompts.</p>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Models Registry */}
      <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Model Registry</h3>
        <p className="text-sm text-muted-foreground">Registered local and external models available to the system.</p>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="p-3 font-medium">Model Key</th>
                <th className="p-3 font-medium">Display Name</th>
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 font-medium">Version</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {aiModels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No models registered
                  </td>
                </tr>
              ) : (
                aiModels.map((model) => (
                  <tr key={model.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{model.model_key}</td>
                    <td className="p-3 font-medium">{model.display_name}</td>
                    <td className="p-3 text-muted-foreground">{model.mode}</td>
                    <td className="p-3 text-muted-foreground">{model.version}</td>
                    <td className="p-3">
                      <Badge variant={model.status.toLowerCase() === "active" ? "default" : "secondary"}>
                        {model.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
