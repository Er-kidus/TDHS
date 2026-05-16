import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "For Patients", href: "/login?tab=patient" },
  { label: "For Clinicians", href: "/login?tab=staff" },
  { label: "For Organizations Registration", href: "/login?tab=org-registration" },
];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI-Powered Triage",
    desc: "Describe your symptoms and our AI instantly assesses severity, recommends the right specialist, and analyzes photos of visible conditions.",
  },
  {
    icon: "📹",
    title: "Secure Video Consultations",
    desc: "HD video and audio sessions with licensed clinicians from the comfort of your home. Fully encrypted end-to-end.",
  },
  {
    icon: "💊",
    title: "Integrated Pharmacy",
    desc: "Prescriptions sent directly to your pharmacy. Order refills, track deliveries, and manage recurring medications in one place.",
  },
  {
    icon: "📋",
    title: "Complete Health Records",
    desc: "Lab results, imaging, visit notes, and prescriptions — all in a unified, searchable health record you own.",
  },
  {
    icon: "🌍",
    title: "Multilingual Support",
    desc: "Full support for Amharic, Oromo, Somali, Tigrinya, Arabic, and English. Healthcare in your language.",
  },
  {
    icon: "🏥",
    title: "Organization Management",
    desc: "Comprehensive dashboards for hospitals and clinics: staff management, scheduling, telemedicine queues, and real-time analytics.",
  },
];

const STEPS = [
  { num: "01", title: "Describe Your Symptoms", desc: "Use our AI chat or quick symptom picker. You can also share a photo of a visible condition for visual analysis." },
  { num: "02", title: "AI Matches You to a Doctor", desc: "Our AI scores and ranks available doctors by specialty, experience, and availability — and shows you why each one is a great fit." },
  { num: "03", title: "Connect in Minutes", desc: "One click to start a video, audio, or chat consultation. Your doctor gets your AI-generated triage context instantly." },
];

const STATS = [
  { value: "< 5 min", label: "Average wait time" },
  { value: "98%", label: "Patient satisfaction" },
  { value: "24/7", label: "Service availability" },
  { value: "15+", label: "Specialties covered" },
];

const FAQS = [
  { q: "Is Tenadam a replacement for in-person care?", a: "No. Tenadam is designed to supplement, not replace, in-person care. We help you get fast access to guidance, prescriptions, and specialist referrals. For emergencies, always call local emergency services." },
  { q: "Is my medical data secure?", a: "Yes. All data is encrypted in transit and at rest. We comply with healthcare data protection standards and your records are only accessible to you and your authorized care team." },
  { q: "What devices can I use?", a: "Tenadam works on any modern browser — desktop, tablet, or mobile. No app download required. Video consultations work on any device with a camera." },
  { q: "How does the AI image analysis work?", a: "You can upload or take a photo of a visible symptom (rash, swelling, eye redness, etc.). Our AI powered by Google Gemini Vision analyzes the image and provides visual findings to share with your doctor. It is not a diagnosis." },
  { q: "How do I get started as an organization?", a: "Click 'For Organizations' and create an account. Our onboarding team will verify your credentials and have you set up within 24 hours." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-md backdrop-blur" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
              <span className="text-sm text-white">✚</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Tenadam</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 transition hover:text-blue-600">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href="/login" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-16 text-center">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/60 to-cyan-100/40 blur-3xl" />

        {/* Pill badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          AI-Powered Telemedicine Platform · Ethiopia & Beyond
        </div>

        <h1 className="relative mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          Healthcare at the{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Speed of AI
          </span>
        </h1>

        <p className="relative mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
          Describe your symptoms. Upload a photo. Get matched with the right doctor in seconds —
          then connect instantly via video, audio, or chat. Healthcare redesigned for real people.
        </p>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/login?tab=patient"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/40"
          >
            🩺 Talk to a Doctor Now
          </a>
          <a
            href="/login?tab=staff"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            🏥 Organization Portal →
          </a>
        </div>

        {/* Stats bar */}
        <div className="relative mt-16 grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur shadow-xl sm:grid-cols-4 max-w-3xl w-full mx-auto">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-blue-600">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">What We Offer</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
              Everything you need, in one platform
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              From symptom checking to specialist consultations to pharmacy delivery — Tenadam covers the full care journey.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="group rounded-3xl border border-slate-100 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-2xl shadow-sm group-hover:from-blue-200 group-hover:to-cyan-200 transition">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">How It Works</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">From symptom to doctor in 3 steps</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map(step => (
              <div key={step.num} className="rounded-3xl bg-white/10 p-7 backdrop-blur border border-white/20 shadow-lg">
                <p className="text-4xl font-black text-white/20">{step.num}</p>
                <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI section */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">AI Medical Intelligence</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                Smarter care starts with smarter triage
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Our AI triage engine, powered by Google Gemini, analyzes your symptoms in real-time — including visual symptom analysis from photos — to determine urgency and match you with the right specialist. Doctors receive your AI-generated summary before the call even starts.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Text + image symptom analysis",
                  "Real-time urgency scoring (low → emergent)",
                  "Specialist matching with scoring explanations",
                  "AI-generated session notes during consultations",
                  "Multilingual responses",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="http://localhost:3000/ai-assistant"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                >
                  ✨ Try the AI Assistant →
                </a>
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center">✨</div>
                <div>
                  <p className="text-xs font-semibold text-blue-300">AI Health Assistant</p>
                  <p className="text-sm font-bold text-white">Powered by Gemini</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl rounded-bl-sm bg-slate-700/60 px-4 py-3 text-sm text-slate-200">
                  I've had a fever of 38.5°C and a dry cough for 3 days. I also have a rash on my arm.
                </div>
                <div className="rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white">
                  Based on your symptoms (fever, cough, rash), your urgency level is <strong>Moderate</strong>. I recommend seeing an <strong>Infectious Disease</strong> specialist. I also analyzed your rash photo — it shows an erythematous maculopapular pattern. Shall I find you an available doctor now?
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                    3 doctors available now
                  </div>
                  <div className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                    Moderate priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-2xl md:p-14">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">For Healthcare Organizations</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Run your entire operation from one dashboard
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  Tenadam gives your hospital or clinic real-time visibility across all departments: telemedicine queue, staff availability, lab orders, pharmacy, scheduling, and AI analytics — all in one place.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="/login?tab=staff"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    🏥 Clinician / Staff Portal →
                  </a>
                  <a
                    href="/login?tab=org-registration"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Organization Sign Up →
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "👥", title: "Staff Management", desc: "Roles, schedules, compliance" },
                  { icon: "📊", title: "Real-time Analytics", desc: "Queue, performance, outcomes" },
                  { icon: "💊", title: "Integrated Pharmacy", desc: "Inventory, dispensing, orders" },
                  { icon: "🤖", title: "AI Triage Queue", desc: "Smart urgency-based routing" },
                ].map(item => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                    <div className="text-2xl">{item.icon}</div>
                    <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-slate-900"
                >
                  {faq.q}
                  <span className={`text-blue-600 text-lg transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-500 text-center text-white">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Ready to get started?</h2>
          <p className="mt-5 text-lg text-blue-100">
            Join thousands of patients getting faster, smarter healthcare with Tenadam.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/login?tab=patient"
              className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-600 shadow-xl transition hover:bg-blue-50 hover:-translate-y-0.5"
            >
              🩺 Patient Portal →
            </a>
            <a
              href="/login?tab=staff"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              🏥 Organization Portal →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                <span className="text-xs text-white">✚</span>
              </div>
              <span className="text-sm font-bold text-slate-900">Tenadam Health System</span>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Tenadam. Not a substitute for professional medical advice.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-blue-600">Privacy</a>
              <a href="#" className="hover:text-blue-600">Terms</a>
              <a href="#" className="hover:text-blue-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
