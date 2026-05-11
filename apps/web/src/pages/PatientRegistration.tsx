import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Upload, ChevronRight, ChevronLeft } from "lucide-react";

const steps = ["Personal Info", "Contact Details", "Next of Kin", "Consent"];

const PatientRegistration: React.FC = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("nav.registration")}</h1>
        <p className="text-sm text-muted-foreground">Register a new patient into the system</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-1.5">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < currentStep ? "bg-success text-success-foreground" :
                i === currentStep ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i === currentStep ? "font-medium" : "text-muted-foreground"}`}>{step}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form steps */}
      <div className="bg-card rounded-lg border shadow-soft p-6 space-y-4">
        {currentStep === 0 && (
          <>
            <h2 className="text-sm font-semibold mb-3">Personal Information</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border cursor-pointer hover:bg-muted/80 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Patient Photo</p>
                <p>Upload a photo or take one</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-sm font-medium">First Name *</label><Input placeholder="Enter first name" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Last Name *</label><Input placeholder="Enter last name" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Date of Birth *</label><Input type="date" className="h-10" /></div>
              <div className="space-y-1.5">
                <label htmlFor="patient-gender" className="text-sm font-medium">Gender *</label>
                <select
                  id="patient-gender"
                  title="Gender"
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Blood Type</label><Input placeholder="e.g., O+" className="h-10" /></div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">ID Document</label>
                <div className="h-10 border rounded-md flex items-center px-3 gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload ID</span>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h2 className="text-sm font-semibold mb-3">Contact Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-sm font-medium">Phone Number *</label><Input placeholder="+251 9XX XXX XXXX" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Email</label><Input placeholder="email@example.com" className="h-10" /></div>
              <div className="sm:col-span-2 space-y-1.5"><label className="text-sm font-medium">Address *</label><Textarea placeholder="Street address, city, region" rows={2} /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Kebele</label><Input placeholder="Kebele number" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Woreda</label><Input placeholder="Woreda" className="h-10" /></div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-sm font-semibold mb-3">Next of Kin</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-sm font-medium">Full Name *</label><Input placeholder="Full name" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Relationship *</label><Input placeholder="e.g., Spouse, Parent" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Phone Number *</label><Input placeholder="+251 9XX XXX XXXX" className="h-10" /></div>
              <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><Input placeholder="Address" className="h-10" /></div>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h2 className="text-sm font-semibold mb-3">Consent & Confirmation</h2>
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" />
                <span>I consent to the collection and processing of my personal health data by Tenadam Healthcare System.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" />
                <span>I authorize the sharing of my medical information with treating physicians and healthcare staff.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" />
                <span>I have reviewed and confirm the information provided is accurate.</span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> {t("common.back")}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)} className="gap-1.5">
            {t("common.next")} <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-1.5">
            <CheckCircle className="h-4 w-4" /> {t("common.submit")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientRegistration;
