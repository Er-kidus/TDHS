"use client";

import { useMemo, useState } from "react";
import {
  X,
  FlaskConical,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Search,
} from "lucide-react";

type Priority = "routine" | "urgent" | "asap";
type ServiceArea = "lab" | "imaging";

interface LabOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (
    tests: string[],
    priority: Priority,
    serviceArea: ServiceArea,
    indication: string,
  ) => Promise<void>;
  defaultPriority?: Priority;
  defaultService?: ServiceArea;
}

export default function LabOrderModal({
  open,
  onClose,
  onSend,
  defaultPriority = "routine",
  defaultService = "lab",
}: LabOrderModalProps) {
  const [activeCategory, setActiveCategory] = useState("Blood");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [priority, setPriority] = useState<Priority>(defaultPriority);
  const [serviceArea, setServiceArea] =
    useState<ServiceArea>(defaultService);
  const [indication, setIndication] = useState("");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => ({
      Blood: [
        "Complete Blood Count (CBC)",
        "CBC with differential",
        "Peripheral blood smear",
        "ESR (Erythrocyte sedimentation rate)",
        "Hemoglobin (Hb)",
        "Hematocrit (HCT)",
        "RBC count",
        "WBC count",
        "Platelet count",
        "Reticulocyte count",
        "Absolute eosinophil count test",
        "Red cell indices (MCV, MCH, MCHC)",
        "Blood film morphology",
      ],
      Coagulation: [
        "Clotting time test",
        "Bleeding time test",
        "Prothrombin time (PT)",
        "INR",
        "aPTT",
        "D-Dimer",
        "Fibrinogen level",
      ],
      Immunology: [
        "CRP test",
        "Rheumatoid factor (RF)",
        "ANA",
        "Anti-CCP antibody",
        "HIV test",
        "Hepatitis B surface antigen (HBsAg)",
        "Hepatitis C antibody",
        "Syphilis test (VDRL/RPR)",
      ],
      Biochemistry: [
        "Lipid profile",
        "Liver function test (LFT)",
        "Kidney function test (KFT)",
        "Electrolyte panel (Na, K, Cl, HCO3)",
        "Blood glucose (FBS/RBS)",
        "HbA1c",
      ],
      Urine: [
        "Urinalysis (full report)",
        "Urine microscopy",
        "Urine culture & sensitivity",
        "Urine pregnancy test",
      ],
      Microbiology: [
        "Blood culture",
        "Urine culture",
        "Sputum culture",
        "Stool culture",
        "Antibiotic sensitivity test (AST)",
      ],
      "Endocrinology / Hormones": [
        "Thyroid function test (TFT)",
        "Cortisol",
        "Insulin level",
        "Vitamin D (25-OH)",
        "HbA1c",
      ],
      "CSF / Special": [
        "CSF analysis",
        "CSF cell count",
        "CSF glucose",
        "CSF protein",
        "CSF culture & sensitivity",
      ],
      Radiology: [
        "Chest X-Ray",
        "Abdominal Ultrasound",
        "CT Scan Brain",
        "MRI Spine",
        "Pelvic Ultrasound",
        "Echocardiography",
        "Mammography",
      ],
    }),
    [],
  );

  const selectedList = Object.keys(selected).filter((k) => selected[k]);

  const filteredTests = (
    categories[activeCategory as keyof typeof categories] || []
  ).filter((test) =>
    test.toLowerCase().includes(search.toLowerCase()),
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-screen items-start justify-center p-3 sm:p-5 lg:p-8">
        <div className="w-full max-w-7xl rounded-3xl border border-border bg-background shadow-2xl">
          {/* HEADER */}
          <header className="sticky top-0 z-20 flex flex-col gap-4 rounded-t-3xl border-b border-border bg-background/95 p-4 backdrop-blur sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  {serviceArea === "imaging" ? (
                    <ScanLine className="h-5 w-5 text-primary" />
                  ) : (
                    <FlaskConical className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Create Diagnostic Order
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Select laboratory or radiology investigations for the patient.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* PRIORITY */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as Priority)
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="asap">ASAP</option>
                  </select>
                </div>

                {/* SERVICE */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Department
                  </label>

                  <select
                    value={serviceArea}
                    onChange={(e) => {
                      const value = e.target.value as ServiceArea;
                      setServiceArea(value);

                      if (value === "imaging") {
                        setActiveCategory("Radiology");
                      } else {
                        setActiveCategory("Blood");
                      }
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="lab">Laboratory</option>
                    <option value="imaging">Radiology</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* BODY */}
          <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[260px_1fr_360px]">
            {/* CATEGORY SIDEBAR */}
            <aside className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tests..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {Object.keys(categories)
                  .filter((cat) =>
                    serviceArea === "imaging"
                      ? cat === "Radiology"
                      : cat !== "Radiology",
                  )
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-background hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </aside>

            {/* TEST LIST */}
            <main className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeCategory}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Select one or more investigations.
                  </p>
                </div>

                <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {filteredTests.length} Tests
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filteredTests.map((test) => (
                  <label
                    key={test}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      selected[test]
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected[test]}
                      onChange={(e) =>
                        setSelected((s) => ({
                          ...s,
                          [test]: e.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-border"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-relaxed">
                        {test}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {serviceArea === "imaging"
                          ? "Radiology investigation"
                          : "Laboratory investigation"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {filteredTests.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                  <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="text-sm font-medium">
                    No matching tests found
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search query.
                  </p>
                </div>
              )}
            </main>

            {/* SUMMARY */}
            <aside className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Order Summary
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Selected Orders
                  </h3>
                </div>

                <div className="flex h-10 min-w-[40px] items-center justify-center rounded-full bg-primary/10 px-3 text-sm font-bold text-primary">
                  {selectedList.length}
                </div>
              </div>

              <div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {selectedList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-5 text-center">
                    <Clock3 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

                    <p className="text-sm font-medium">
                      No investigations selected
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Selected tests will appear here.
                    </p>
                  </div>
                ) : (
                  selectedList.map((test) => (
                    <div
                      key={test}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />

                        <div>
                          <p className="text-sm font-medium leading-relaxed">
                            {test}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [test]: false,
                          }))
                        }
                        className="text-xs font-medium text-red-500 transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* INDICATION */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Clinical Indication
                </label>

                <textarea
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="Enter symptoms, provisional diagnosis, or clinical reason for ordering..."
                  rows={5}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-2xl border border-border px-5 text-sm font-medium transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={selectedList.length === 0}
                  onClick={async () => {
                    if (!selectedList.length) return;

                    await onSend(
                      selectedList,
                      priority,
                      serviceArea,
                      indication,
                    );

                    setSelected({});
                    setIndication("");
                    onClose();
                  }}
                  className="h-11 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send to{" "}
                  {serviceArea === "imaging"
                    ? "Radiology"
                    : "Laboratory"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}