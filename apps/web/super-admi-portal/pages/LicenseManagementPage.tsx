import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

interface License {
  license_number: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  issued_date: string;
  expiry_date: string;
}

export function LicenseManagementPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLicenses() {
      try {
        const token = localStorage.getItem("tdhs_admin_token") || "";
        const res = await apiFetch("/org/system/licenses", { token });

        if (!res.ok) {
          throw new Error("Failed to load licenses");
        }

        const data = await res.json();
        setLicenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    void loadLicenses();
  }, []);

  if (loading) {
    return <div className="p-6">Loading licenses...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">License Management</h1>
        <p className="text-muted-foreground mt-1">
          Registry of healthcare professionals and their license statuses.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.license_number}>
                <TableCell className="font-medium">{license.license_number}</TableCell>
                <TableCell>{license.first_name} {license.last_name}</TableCell>
                <TableCell className="capitalize">{license.role}</TableCell>
                <TableCell>
                  <Badge variant={license.status === 'active' ? 'default' : license.status === 'expired' ? 'destructive' : 'secondary'}>
                    {license.status}
                  </Badge>
                </TableCell>
                <TableCell>{license.issued_date}</TableCell>
                <TableCell>{license.expiry_date}</TableCell>
              </TableRow>
            ))}
            {licenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No licenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
