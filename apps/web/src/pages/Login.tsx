import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Globe, Moon, Sun, User, Building2, Stethoscope, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Login: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse 'tab' query param to set initial active tab, default to 'patient'
  const defaultTab = searchParams.get("tab") || "patient";
  const [activeTab, setActiveTab] = useState<string>(
    ["patient", "staff", "org-registration"].includes(defaultTab) ? defaultTab : "patient"
  );

  // Sync tab state to URL parameter
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

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

  // ✅ LANGUAGE PERSISTENCE
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "am" || storedLang === "en") {
      setLanguage(storedLang);
    }
  }, [setLanguage]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  // Content configuration
  const content = {
    en: {
      title: "Welcome to Tenadam",
      subtitle: "Select your portal to continue",
      patient: {
        title: "Patient Portal",
        desc: "Access your medical records, book appointments, and connect with doctors.",
        login: "Sign In as Patient",
        signup: "Create Patient Account",
        urlLogin: "http://localhost:3000/login",
        urlSignup: "http://localhost:3000/register"
      },
      staff: {
        title: "Organization Service",
        desc: "For doctors, nurses, and hospital staff to manage patients and clinical workflows.",
        login: "Sign In as Staff",
        urlLogin: "http://localhost:4000/login"
      },
      registration: {
        title: "Organization Registration",
        desc: "Register your hospital or clinic on the Tenadam network.",
        login: "Sign In to Registration Portal",
        signup: "Register New Organization",
        urlLogin: "http://localhost:4173/login",
        urlSignup: "http://localhost:4173/register"
      }
    },
    am: {
      title: "እንኳን ወደ ጤናዳም በደህና መጡ",
      subtitle: "ለመቀጠል የትኛውን መግቢያ እንደሚፈልጉ ይምረጡ",
      patient: {
        title: "የታካሚ መግቢያ",
        desc: "የህክምና መረጃዎን ያግኙ፣ ቀጠሮ ይያዙ እና ከሀኪሞች ጋር ይገናኙ።",
        login: "እንደ ታካሚ ይግቡ",
        signup: "የታካሚ መለያ ይፍጠሩ",
        urlLogin: "http://localhost:3000/login",
        urlSignup: "http://localhost:3000/register"
      },
      staff: {
        title: "የተቋም አገልግሎት",
        desc: "ለሀኪሞች፣ ለነርሶች እና ለሆስፒታል ሰራተኞች ታካሚዎችን እና የህክምና ሂደቶችን ለማስተዳደር።",
        login: "እንደ ሰራተኛ ይግቡ",
        urlLogin: "http://localhost:4000/login"
      },
      registration: {
        title: "የተቋም ምዝገባ",
        desc: "ሆስፒታልዎን ወይም ክሊኒክዎን በጤናዳም አውታረመረብ ላይ ይመዝገቡ።",
        login: "ወደ ምዝገባ መግቢያ ይግቡ",
        signup: "አዲስ ተቋም ይመዝገቡ",
        urlLogin: "http://localhost:4173/login",
        urlSignup: "http://localhost:4173/register"
      }
    }
  };

  const t = content[language as "en" | "am"] || content.en;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07111f] transition-colors">
      {/* NAVBAR */}
      <nav className="h-16 border-b bg-white/50 dark:bg-[#0f1b2d]/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Tenadam</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode((p) => !p)}
            className="h-9 w-9 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setLanguage(language === "en" ? "am" : "en")}
            className="h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Globe size={16} />
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background decorators */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
        
        <div className="w-full max-w-xl relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f1b2d] rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800/60 p-2 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-14 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                <TabsTrigger value="patient" className="rounded-xl data-[state=active]:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a2942] transition-all">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User size={16} className="hidden sm:block" />
                    Patient
                  </div>
                </TabsTrigger>
                <TabsTrigger value="staff" className="rounded-xl data-[state=active]:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a2942] transition-all">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Stethoscope size={16} className="hidden sm:block" />
                    Staff
                  </div>
                </TabsTrigger>
                <TabsTrigger value="org-registration" className="rounded-xl data-[state=active]:shadow-sm data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a2942] transition-all">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 size={16} className="hidden sm:block" />
                    Registration
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6 md:p-8 mt-2 min-h-[280px] flex items-center">
                {/* PATIENT TAB */}
                <TabsContent value="patient" className="w-full m-0 space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                      <User size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.patient.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                      {t.patient.desc}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <Button asChild className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:-translate-y-0.5 transition-transform">
                      <a href={t.patient.urlLogin}>
                        {t.patient.login} <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base font-semibold bg-slate-50 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800">
                      <a href={t.patient.urlSignup}>
                        {t.patient.signup}
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* STAFF TAB */}
                <TabsContent value="staff" className="w-full m-0 space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                      <Stethoscope size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.staff.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                      {t.staff.desc}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <Button asChild className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-base font-semibold shadow-md hover:-translate-y-0.5 transition-transform">
                      <a href={t.staff.urlLogin}>
                        {t.staff.login} <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* ORG REGISTRATION TAB */}
                <TabsContent value="org-registration" className="w-full m-0 space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-4">
                      <Building2 size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.registration.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                      {t.registration.desc}
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <Button asChild className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-base font-semibold shadow-md hover:-translate-y-0.5 transition-transform">
                      <a href={t.registration.urlLogin}>
                        {t.registration.login} <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base font-semibold bg-slate-50 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400">
                      <a href={t.registration.urlSignup}>
                        {t.registration.signup}
                      </a>
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-6 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Tenadam Health Technologies
      </footer>
    </div>
  );
};

export default Login;