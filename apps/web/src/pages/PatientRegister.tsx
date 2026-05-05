import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Moon, Sun } from "lucide-react";

export default function PatientRegister() {
  const navigate = useNavigate();
  const { registerPatient } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const copy = useMemo(() => {
    if (language === "am") {
      return {
        title: "የታካሚ መለያ ይፍጠሩ",
        subtitle: "በ API gateway ይመዝገቡ እና ወዲያው ይግቡ።",
        fullName: "ሙሉ ስም",
        email: "ኢሜይል",
        password: "የይለፍ ቃል",
        phone: "ስልክ",
        creating: "በመፍጠር ላይ...",
        create: "መለያ ፍጠር",
        back: "ወደ መግቢያ ተመለስ",
        haveAccount: "መለያ አለዎት?",
      };
    }
    return {
      title: "Create patient account",
      subtitle: "Register via the API gateway and sign in.",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      phone: "Phone",
      creating: "Creating...",
      create: "Create account",
      back: "Back to login",
      haveAccount: "Already have an account?",
    };
  }, [language]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerPatient({ fullName, email, password, phone });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-soft border border-border p-6">
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "am" : "en")}
            className="h-8 rounded-md border border-border px-2.5 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{copy.fullName}</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{copy.email}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{copy.password}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{copy.phone}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" required />
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? copy.creating : copy.create}
          </Button>

          <div className="text-sm text-muted-foreground">
            {copy.haveAccount}{" "}
            <Link to="/" className="text-primary hover:underline">
              {copy.back}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
