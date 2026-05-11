import { Download, Upload } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload, categorize, preview, and download your files.</p>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-soft">
        <Upload className="h-6 w-6 mx-auto text-primary" />
        <p className="mt-2 font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Supported: PDF, JPG, PNG • Max 10MB</p>
        <button className="mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Upload Document</button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {[
          "Lab_Report_Apr_2026.pdf",
          "National_ID.pdf",
          "Prescription_March.pdf",
        ].map((doc) => (
          <div key={doc} className="rounded-lg border border-border bg-background p-3 flex items-center justify-between">
            <span className="text-sm">{doc}</span>
            <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-accent"><Download className="h-3.5 w-3.5" /> Download</button>
          </div>
        ))}
      </section>
    </div>
  );
}
