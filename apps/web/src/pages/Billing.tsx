import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, TrendingUp, DollarSign, FileText, Download, Clock } from "lucide-react";

const invoices = [
  { id: "INV-2026-001", patient: "Abebe Bikila", amount: "ETB 2,500", date: "Apr 5, 2026", status: "paid" },
  { id: "INV-2026-002", patient: "Tirunesh Dibaba", amount: "ETB 1,800", date: "Apr 5, 2026", status: "pending" },
  { id: "INV-2026-003", patient: "Haile G.", amount: "ETB 5,200", date: "Apr 4, 2026", status: "overdue" },
  { id: "INV-2026-004", patient: "Derartu Tulu", amount: "ETB 900", date: "Apr 4, 2026", status: "paid" },
  { id: "INV-2026-005", patient: "Kenenisa B.", amount: "ETB 3,100", date: "Apr 3, 2026", status: "partial" },
];

const Billing: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("nav.billing")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Today's Revenue" value="ETB 12,400" icon={<DollarSign className="h-5 w-5" />} variant="success" trend={{ value: 15, label: "vs yesterday" }} />
        <StatCard title="Pending" value="ETB 8,200" icon={<Clock className="h-5 w-5" />} variant="warning" />
        <StatCard title="Overdue" value="ETB 5,200" icon={<CreditCard className="h-5 w-5" />} variant="destructive" />
        <StatCard title="Monthly Total" value="ETB 186K" icon={<TrendingUp className="h-5 w-5" />} variant="primary" />
      </div>

      <div className="bg-card rounded-lg border shadow-soft">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Invoice</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Patient</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-3 font-medium">{inv.patient}</td>
                  <td className="px-4 py-3 font-semibold">{inv.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={inv.status === "paid" ? "success" : inv.status === "pending" ? "waiting" : inv.status === "overdue" ? "destructive" : "warning"}
                      dot
                    >
                      {inv.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="text-xs gap-1"><FileText className="h-3 w-3" /> View</Button>
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

export default Billing;
