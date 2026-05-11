import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Timeline } from "@/components/shared/Timeline";
import {
  Stethoscope, FileText, Activity, Pill, FlaskConical, Heart,
  ThermometerSun, Clock, Save, AlertTriangle,
} from "lucide-react";

const ClinicalEncounter: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"soap" | "vitals" | "orders" | "timeline">("soap");

  const tabs = [
    { key: "soap" as const, label: "SOAP Notes", icon: FileText },
    { key: "vitals" as const, label: "Vitals", icon: Activity },
    { key: "orders" as const, label: "Orders", icon: Pill },
    { key: "timeline" as const, label: "Timeline", icon: Clock },
  ];

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("nav.clinical")}</h1>
          <p className="text-sm text-muted-foreground">Clinical encounter workspace</p>
        </div>
        <Button size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> {t("common.save")}</Button>
      </div>

      {/* Patient alert */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
        <span className="text-sm text-destructive font-medium">Allergy: Penicillin</span>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors touch-target ${
              activeTab === tab.key ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "soap" && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Subjective", placeholder: "Patient's reported symptoms, complaints, history..." },
            { label: "Objective", placeholder: "Physical examination findings, vital signs..." },
            { label: "Assessment", placeholder: "Diagnosis, differential diagnoses..." },
            { label: "Plan", placeholder: "Treatment plan, medications, follow-up..." },
          ].map((field) => (
            <div key={field.label} className="bg-card rounded-lg border shadow-soft p-4 space-y-2">
              <label className="text-sm font-semibold">{field.label}</label>
              <Textarea placeholder={field.placeholder} rows={4} className="resize-none" />
            </div>
          ))}
          <div className="md:col-span-2 bg-card rounded-lg border shadow-soft p-4 space-y-2">
            <label className="text-sm font-semibold">Diagnosis (ICD-10)</label>
            <Input placeholder="Search diagnosis codes..." className="h-10" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <StatusBadge variant="info">I10 - Essential Hypertension</StatusBadge>
              <StatusBadge variant="info">E11.9 - Type 2 Diabetes</StatusBadge>
            </div>
          </div>
        </div>
      )}

      {activeTab === "vitals" && (
        <div className="bg-card rounded-lg border shadow-soft p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Blood Pressure", icon: Heart, unit: "mmHg", placeholder: "120/80" },
              { label: "Heart Rate", icon: Activity, unit: "bpm", placeholder: "72" },
              { label: "Temperature", icon: ThermometerSun, unit: "°C", placeholder: "36.8" },
              { label: "SpO2", icon: Activity, unit: "%", placeholder: "98" },
              { label: "Respiratory Rate", icon: Activity, unit: "/min", placeholder: "16" },
              { label: "Weight", icon: Activity, unit: "kg", placeholder: "70" },
            ].map((vital) => (
              <div key={vital.label} className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1">
                  <vital.icon className="h-3 w-3 text-primary" /> {vital.label}
                </label>
                <div className="relative">
                  <Input placeholder={vital.placeholder} className="h-10 pr-12" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{vital.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Pill className="h-4 w-4 text-primary" /> Prescriptions</h3>
            <div className="space-y-2">
              {[
                { drug: "Lisinopril 10mg", dose: "1 tab daily", duration: "30 days" },
                { drug: "Metformin 500mg", dose: "1 tab twice daily", duration: "30 days" },
              ].map((rx) => (
                <div key={rx.drug} className="p-2.5 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">{rx.drug}</p>
                  <p className="text-xs text-muted-foreground">{rx.dose} • {rx.duration}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-1.5"><Pill className="h-3.5 w-3.5" /> Add Prescription</Button>
            </div>
          </div>
          <div className="bg-card rounded-lg border shadow-soft p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><FlaskConical className="h-4 w-4 text-primary" /> Lab Orders</h3>
            <div className="space-y-2">
              <div className="p-2.5 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Fasting Blood Sugar</p>
                  <StatusBadge variant="waiting" size="sm">pending</StatusBadge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Request Lab Test</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="bg-card rounded-lg border shadow-soft p-4">
          <Timeline items={[
            { id: "1", title: "Encounter started", description: "Dr. Abebe Tekle", time: "10:00 AM", variant: "info" },
            { id: "2", title: "Vitals recorded", description: "BP: 130/85, HR: 76, T: 36.8°C", time: "10:05 AM", variant: "success" },
            { id: "3", title: "Lab ordered", description: "Fasting Blood Sugar", time: "10:15 AM", variant: "warning" },
            { id: "4", title: "Prescription", description: "Lisinopril 10mg added", time: "10:20 AM", variant: "default" },
          ]} />
        </div>
      )}
    </div>
  );
};

export default ClinicalEncounter;
