import { Download } from "lucide-react";
import type { OrganizationDirectoryItem } from "@/api/organizations";
import { Button } from "@/components/ui/button";
import { typeLabels } from "@/constants/organizations";

interface ExportButtonProps {
  organizations: OrganizationDirectoryItem[];
}

export function ExportButton({ organizations }: ExportButtonProps) {
  function exportCsv() {
    const headers = ["Name", "Type", "Members", "Created"];
    const rows = organizations.map((organization) => [
      organization.name,
      typeLabels[organization.type],
      organization.member_count.toString(),
      new Date(organization.created_at).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `organizations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" onClick={exportCsv} disabled={organizations.length === 0}>
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
