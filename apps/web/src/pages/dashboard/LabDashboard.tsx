import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

const labQueue = [
  { id: "1", patient: "Abebe Bikila", test: "Complete Blood Count", sample: "Blood", status: "processing", priority: "urgent" },
  { id: "2", patient: "Tirunesh Dibaba", test: "Fasting Blood Sugar", sample: "Blood", status: "sample_collected", priority: "scheduled" },
  { id: "3", patient: "Haile G.", test: "Urinalysis", sample: "Urine", status: "pending", priority: "waiting" },
  { id: "4", patient: "Derartu Tulu", test: "Chest X-Ray", sample: "Imaging", status: "completed", priority: "completed" },
  { id: "5", patient: "Kenenisa B.", test: "Liver Function Test", sample: "Blood", status: "processing", priority: "active" },
];

const LabDashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">{t("role.lab")} {t("nav.dashboard")}</h1>
        <p className="text-sm text-muted-foreground">Lab orders, sample tracking & results</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Pending Orders" value="6" icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title="In Processing" value="4" icon={<FlaskConical className="h-5 w-5" />} variant="primary" />
        <StatCard title="Completed Today" value="18" icon={<CheckCircle className="h-5 w-5" />} variant="success" />
        <StatCard title="Critical Results" value="1" icon={<AlertCircle className="h-5 w-5" />} variant="destructive" />
      </div>

      <div className="bg-card rounded-lg border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" /> Test Queue
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Patient</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Test</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Sample</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {labQueue.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{item.patient}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.test}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.sample}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={item.priority as any} size="sm" dot>
                      {item.status.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      {item.status === "completed" ? "View Result" : item.status === "pending" ? "Collect Sample" : "Enter Result"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
