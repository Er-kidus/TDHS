import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Heart, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ THEME
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ✅ LANGUAGE PERSISTENCE (sync with your context)
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "am" || storedLang === "en") {
      setLanguage(storedLang);
    }
  }, [setLanguage]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const copy = useMemo(() => {
    if (language === "am") {
      return {
        portalTitle: "መለያ ያስገቡ",
        signingIn: "በመግባት ላይ..."
      };
    }

    return {
      portalTitle: "Sign In to continue",
     signingIn: "Signing in..."
     };
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password, "org");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ✅ NAVBAR */}
      <nav className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md medical-gradient flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Tenadam</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 🌙 Theme */}
          <button
            onClick={() => setDarkMode((p) => !p)}
            className="h-8 w-8 border rounded-md flex items-center justify-center"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 🌍 Language */}
          <button
            onClick={() => setLanguage(language === "en" ? "am" : "en")}
            className="h-8 px-3 border rounded-md text-xs flex items-center gap-1"
          >
            <Globe size={14} />
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </nav>

      {/* ✅ MAIN */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">

          <div>
            <h2 className="text-xl font-semibold">{copy.portalTitle}</h2>
         
          </div>

          {error && (
            <div className="text-sm text-destructive border p-2 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm">{t("login.email")}</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@tenadam.et"
                className="h-11 mt-1"
              />
            </div>

            <div>
              <label className="text-sm">{t("login.password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 mt-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
{/* 
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(c === true)}
                />
                <span>{t("login.remember")}</span>
              </div>

              <button type="button" className="text-primary hover:underline">
                {t("login.forgot")}
              </button>
            </div> */}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? copy.signingIn : t("login.signin")}
            </Button>
          </form>

          {/* System status */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            {t("login.system_status")}: {t("login.operational")}
          </div>

         
        </div>
      </div>

      {/* ✅ FOOTER */}
      <footer className="h-12 border-t flex items-center justify-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tenadam Health Technologies
      </footer>
    </div>
  );
};

export default Login;