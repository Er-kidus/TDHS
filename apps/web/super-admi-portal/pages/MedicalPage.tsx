import { Input } from "@/components/ui/input";
import { CardShell } from "./common";

export default function MedicalPage() {
  return (
    <div className="space-y-4">
      <CardShell title="Medical Configuration" description="Manage services, rules, and telemedicine settings">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Radiology",
            "Laboratory",
            "Maternity",
            "Emergency Care",
            "Drug Catalog",
            "Telemedicine",
            "Specialty Referrals",
            "Vaccination Program",
          ].map((service) => (
            <div key={service} className="rounded-lg border border-border/70 p-3 text-sm">
              <p className="font-medium">{service}</p>
              <p className="text-xs text-muted-foreground">Configurable service module</p>
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell title="Appointment Rules" description="Validation and scheduling policies">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm"><span className="font-medium">Max daily appointments per doctor</span><Input defaultValue="36" /></label>
          <label className="space-y-1 text-sm"><span className="font-medium">Minimum booking lead time (minutes)</span><Input defaultValue="30" /></label>
        </div>
      </CardShell>
    </div>
  );
}